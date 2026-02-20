import { toast } from 'sonner';

export interface ImageAnalysisResult {
    valid: boolean;
    reason?: string;
    data: Record<string, any>;
}

const CATEGORY_PROMPTS: Record<string, string> = {
    kitchen: `
        Analyze this image. 
        1. VALIDATION: Is this a kitchen? (YES/NO). If NO, explain why.
        2. EXTRACTION:
           - turning_circle: Does it look like there is a 1500mm turning circle? (true/false)
           - turning_circle_170x140: Does it look like there is a 1700x1400mm turning ellipse? (true/false)
           - accessible_layout: Are units accessible? (true/false)
           - separate_from_living: Is it a separate room from the living area? (true/false)
        
        RETURN JSON: { "valid": boolean, "reason": string, "data": { "turning_circle": boolean, "turning_circle_170x140": boolean, "accessible_layout": boolean, "separate_from_living": boolean } }
    `,
    bathroom: `
        Analyze this image.
        1. VALIDATION: Is this a bathroom or toilet? (YES/NO). If NO, explain why.
        2. EXTRACTION:
           - bathing_type: 'Level Access Shower', 'Shower Cubicle', 'Over-Bath Shower', 'Bath Only'
           - toilet_type: 'Standard', 'Raised Height', 'Wash/Dry (Smart)'
           - turning_circle: Does it look like there is a 1500mm turning circle? (true/false)
           - has_bath: boolean
           - has_shower: boolean
           - walls: 'Solid', 'Stud', 'Unknown' (for adaptation feasibility)
        
        RETURN JSON: { "valid": boolean, "reason": string, "data": { "bathing_type": string, "toilet_type": string, "turning_circle": boolean, "has_bath": boolean, "has_shower": boolean, "walls": string } }
    `,
    entrance: `
        Analyze this image.
        1. VALIDATION: Is this a property entrance (door/porch)? (YES/NO).
        2. EXTRACTION:
           - entrance_level: 'Ground Floor', 'Upper Floor', 'Basement', 'Split Level'
           - step_count: Number of steps visible (number)
           - step_type: 'No steps', ' Few steps', 'Steep slope', 'Steady slope'
           - door_width_visual: 'Wide (>80cm)', 'Standard (70-80cm)', 'Narrow (<70cm)'
           - threshold_height: 'Flush', 'Low (<15mm)', 'High (>15mm)'
        
        RETURN JSON: { "valid": boolean, "reason": string, "data": { "entrance_level": string, "step_count": number, "step_type": string, "door_width_visual": string, "threshold_height": string } }
    `,
    stairs: `
        Analyze this image.
        1. VALIDATION: Is this a staircase? (YES/NO).
        2. EXTRACTION:
           - has_stairs: true
           - stair_type: 'Straight', 'Quarter Turn', 'Half Turn', 'Spiral', 'Winding'
           - handrails: 'None', 'Left Side', 'Right Side', 'Both Sides'
           - stair_lift_present: boolean
        
        RETURN JSON: { "valid": boolean, "reason": string, "data": { "has_stairs": boolean, "stair_type": string, "handrails": string, "stair_lift_present": boolean } }
    `,
    hallway: `
        Analyze this image.
        1. VALIDATION: Is this a hallway/corridor? (YES/NO).
        2. EXTRACTION:
           - width_visual: 'Wide (>120cm)', 'Standard (90-120cm)', 'Narrow (<90cm)'
           - obstructions: 'None', 'Radiator', 'Furniture', 'Boxed pipes'
           - door_clearance: 'Good', 'Restricted'
        
        RETURN JSON: { "valid": boolean, "reason": string, "data": { "width_visual": string, "obstructions": string, "door_clearance": string } }
    `,
    garden: `
        Analyze this image.
        1. VALIDATION: Is this a garden or external access area? (YES/NO).
        2. EXTRACTION:
           - access_type: 'Level', 'Ramped', 'Stepped'
           - step_count: number
           - surface: 'Paved', 'Grass', 'Gravel', 'Decking'
        
        RETURN JSON: { "valid": boolean, "reason": string, "data": { "access_type": string, "step_count": number, "surface": string } }
    `
};

export interface BatchAnalysisResult {
    results: Record<string, ImageAnalysisResult>;
    safety: {
        second_exit_suggested: boolean;
        suggested_hazards: string;
    };
}

export const analyzeAllCategoryPhotos = async (categoryPhotos: Record<string, string[]>): Promise<BatchAnalysisResult | null> => {
    try {
        const images: Array<{ mime_type: string, data: string, category: string }> = [];
        const categoriesPresent: string[] = [];

        // Collect first photo from each category
        Object.entries(categoryPhotos).forEach(([category, photos]) => {
            if (photos && photos.length > 0) {
                // Determine mime type from base64 string (usually data:image/jpeg;base64,...)
                const firstPhoto = photos[0];
                const match = firstPhoto.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
                
                if (match) {
                    images.push({
                        mime_type: match[1],
                        data: match[2], // raw base64 data
                        category: category
                    });
                    categoriesPresent.push(category);
                }
            }
        });

        if (images.length === 0) return null;

        const prompt = `
            Analyze these ${images.length} images. Each image corresponds to a specific category.
            Image Order: ${categoriesPresent.join(', ')}.

            For EACH image/category pair, perform validation and extraction.
            
            1. Kitchen:
               - valid: Is it a kitchen?
               - turning_circle: 1500mm turning circle visible? (true/false)
               - turning_circle_170x140: 1700x1400mm ellipse visible? (true/false)
               - accessible_layout: Units accessible? (true/false)
               - separate_from_living: Separate room? (true/false)
               - safety_hazards: Any visible hazards? (e.g. trailing wires, clutter)

            2. Bathroom:
               - valid: Is it a bathroom/toilet?
               - bathing_type: 'Level Access Shower', 'Shower Cubicle', 'Over-Bath Shower', 'Bath Only'
               - toilet_type: 'Standard', 'Raised Height', 'Wash/Dry (Smart)'
               - turning_circle: 1500mm visible? (true/false)
               - has_bath: boolean
               - has_shower: boolean
               - walls: 'Solid', 'Stud', 'Unknown'
               - safety_hazards: e.g. lack of grab rails, slippery floor

            3. Entrance:
               - valid: Is it an entrance?
               - entrance_level: 'Ground Floor', 'Upper Floor', 'Basement'
               - step_count: number
               - step_type: 'No steps', 'Few steps', 'Steep'
               - door_width_visual: 'Wide', 'Standard', 'Narrow'
               - threshold_height: 'Flush', 'Low', 'High'
               - second_exit_indicator: Does it look like a back door / secondary exit? (true/false)

            4. Stairs:
               - valid: Is it a staircase?
               - has_stairs: true
               - stair_type: 'Straight', 'Quarter Turn', 'Half Turn', 'Spiral'
               - handrails: 'None', 'Left', 'Right', 'Both'
               - stair_lift_present: boolean
               - safety_hazards: e.g. loose carpet, no handrail

            5. Hallway:
               - valid: Is it a hallway?
               - width_visual: 'Wide', 'Standard', 'Narrow'
               - obstructions: 'None', 'Radiator', 'Furniture', 'Boxed pipes'
               - door_clearance: 'Good', 'Restricted'
               - safety_hazards: e.g. clutter, trip hazards

            6. Garden:
               - valid: Is it a garden/external?
               - access_type: 'Level', 'Ramped', 'Stepped'
               - step_count: number
               - surface: 'Paved', 'Grass', 'Gravel'
               - second_exit_suggested: Does this look like a secondary escape route? (true/false)

            RETURN A SINGLE JSON OBJECT with this structure:
            {
                "results": {
                    "kitchen": { "valid": boolean, "reason": "...", "data": { ...extracted fields... } },
                    "bathroom": { "valid": boolean, "reason": "...", "data": { ...extracted fields... } },
                    ... for all provided categories
                },
                "safety": {
                    "second_exit_suggested": boolean (true if garden or entrance suggests second exit),
                    "suggested_hazards": "Comma separated string of all identified hazards from all rooms"
                }
            }
        `;

        const requestBody = {
            prompt,
            images: images.map(img => ({
                mime_type: img.mime_type,
                data: img.data
            }))
        };

        const response = await fetch('/api/gemini/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            console.error('Gemini Batch Analysis Failed:', response.statusText);
            return null;
        }

        const data = await response.json();
        let cleanJson = data.result;

        // Clean up JSON if it's a string
        if (typeof cleanJson === 'string') {
            if (cleanJson.includes('```json')) {
                cleanJson = cleanJson.replace(/```json\n?/, '').replace(/```/, '');
            } else if (cleanJson.includes('```')) {
                cleanJson = cleanJson.replace(/```\n?/, '').replace(/```/, '');
            }
            try {
                cleanJson = JSON.parse(cleanJson);
            } catch (e) {
                console.error("Failed to parse AI response JSON", e);
                return null;
            }
        }

        return cleanJson as BatchAnalysisResult;

    } catch (error) {
        console.error('Error in batch analysis:', error);
        return null;
    }
};

export const analyzeCategoryPhoto = async (file: File, categoryId: string): Promise<ImageAnalysisResult | null> => {
    try {
        const prompt = CATEGORY_PROMPTS[categoryId];
        if (!prompt) {
            console.warn(`No prompt defined for category: ${categoryId}`);
            return null;
        }

        // Convert file to base64
        const base64Data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });

        const requestBody = {
            prompt,
            images: [{
                mime_type: file.type,
                data: base64Data
            }]
        };

        const response = await fetch('/api/gemini/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            console.error('Gemini Analysis Failed:', response.statusText);
            return null;
        }

        const data = await response.json();
        let cleanJson = data.result;

        // Clean up JSON if it's a string
        if (typeof cleanJson === 'string') {
            if (cleanJson.includes('```json')) {
                cleanJson = cleanJson.replace(/```json\n?/, '').replace(/```/, '');
            } else if (cleanJson.includes('```')) {
                cleanJson = cleanJson.replace(/```\n?/, '').replace(/```/, '');
            }
            try {
                cleanJson = JSON.parse(cleanJson);
            } catch (e) {
                console.error("Failed to parse AI response JSON", e);
                return null;
            }
        }

        return cleanJson as ImageAnalysisResult;

    } catch (error) {
        console.error('Error analyzing photo:', error);
        return null;
    }
};
