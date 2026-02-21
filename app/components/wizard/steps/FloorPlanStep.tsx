
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { WizardStepProps } from '../types';

const FloorPlanStep: React.FC<WizardStepProps> = ({
    formData,
    handleUpdateField,
    handlePhotoUpload,
    isAnalyzing,
    floorPlanAnalysis
}) => {
    const hasPlan = !!formData.floorPlan;
    const planUrl = React.useMemo(() => {
        if (!formData.floorPlan) return null;
        if (typeof formData.floorPlan === 'string') return formData.floorPlan;
        return URL.createObjectURL(formData.floorPlan);
    }, [formData.floorPlan]);

    // Color mapping for annotation types
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'door': return { border: '#22c55e', bg: 'rgba(34, 197, 94, 0.2)', text: '#15803d' }; // Green
            case 'stairs': return { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)', text: '#b45309' }; // Amber
            case 'ramp': return { border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.2)', text: '#1d4ed8' }; // Blue
            case 'lift': return { border: '#a855f7', bg: 'rgba(168, 85, 247, 0.2)', text: '#7e22ce' }; // Purple
            case 'second_exit': return { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)', text: '#b91c1c' }; // Red
            default: return { border: '#64748b', bg: 'rgba(100, 116, 139, 0.2)', text: '#334155' }; // Slate
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            style={{ padding: '16px', textAlign: 'center' }}
        >
            <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)', marginBottom: '2px' }}>Floor Plan Analysis</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>Upload a drawing to automate 80% of the accessibility assessment.</p>
            </div>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <label
                    htmlFor="floorPlanUpload"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: hasPlan ? '0' : '32px 20px',
                        border: hasPlan ? 'none' : '2px dashed',
                        borderColor: isAnalyzing ? 'var(--primary)' : '#cbd5e1',
                        background: isAnalyzing ? 'var(--primary-light)' : hasPlan ? '#fff' : '#f8fafc',
                        borderRadius: '20px',
                        cursor: isAnalyzing ? 'wait' : 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        minHeight: hasPlan ? 'auto' : '200px'
                    }}
                >
                    <input
                        type="file"
                        id="floorPlanUpload"
                        accept="image/*,.pdf"
                        hidden
                        onChange={handlePhotoUpload}
                        disabled={isAnalyzing}
                    />

                    <AnimatePresence mode="wait">
                        {isAnalyzing ? (
                            <motion.div
                                key="analyzing"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px' }}
                            >
                                <Loader2 className="animate-spin" size={40} color="var(--primary)" />
                                <span style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '14px' }}>AI is scanning floor plan...</span>
                            </motion.div>
                        ) : hasPlan && planUrl ? (
                            <motion.div
                                key="done"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ width: '100%', position: 'relative' }}
                            >
                                {/* Image Container */}
                                <div style={{ position: 'relative', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                    <img 
                                        src={planUrl} 
                                        alt="Floor Plan" 
                                        style={{ width: '100%', height: 'auto', display: 'block' }} 
                                    />
                                    
                                    {/* Overlays */}
                                    {floorPlanAnalysis?.annotations?.map((ann, idx) => {
                                        const [ymin, xmin, ymax, xmax] = ann.bbox;
                                        const style = getTypeColor(ann.type);
                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    position: 'absolute',
                                                    top: `${(ymin / 1000) * 100}%`,
                                                    left: `${(xmin / 1000) * 100}%`,
                                                    height: `${((ymax - ymin) / 1000) * 100}%`,
                                                    width: `${((xmax - xmin) / 1000) * 100}%`,
                                                    border: `2px solid ${style.border}`,
                                                    backgroundColor: style.bg,
                                                    borderRadius: '4px',
                                                    pointerEvents: 'none'
                                                }}
                                            >
                                                {ann.label && (
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '-20px',
                                                        left: '0',
                                                        background: style.border,
                                                        color: '#fff',
                                                        fontSize: '10px',
                                                        fontWeight: '700',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        whiteSpace: 'nowrap',
                                                        zIndex: 10
                                                    }}>
                                                        {ann.label}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                    
                                    {/* Replace Overlay on Hover */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(0,0,0,0.4)',
                                        opacity: 0,
                                        transition: 'opacity 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#fff',
                                        fontWeight: '700',
                                        className: 'hover:opacity-100' // Note: inline styles used mostly, handling hover via CSS class or state would be cleaner but complex here. 
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '20px' }}>
                                            <Upload size={16} />
                                            <span>Click to Replace</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Analysis Summary / Legend */}
                                {floorPlanAnalysis && (
                                    <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                                        {floorPlanAnalysis.entrance_level && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#166534' }}>
                                                    {floorPlanAnalysis.entrance_level.value} Level
                                                </span>
                                            </div>
                                        )}
                                        {floorPlanAnalysis.lift?.detected && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f3e8ff', borderRadius: '8px', border: '1px solid #d8b4fe' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a855f7' }} />
                                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b21a8' }}>
                                                    Lift Detected
                                                </span>
                                            </div>
                                        )}
                                        {floorPlanAnalysis.annotations?.some(a => a.type === 'stairs') && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#fff7ed', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                                                <span style={{ fontSize: '12px', fontWeight: '600', color: '#9a3412' }}>
                                                    Stairs Found
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
                            >
                                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                                    <Upload size={24} />
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ display: 'block', fontWeight: '800', color: '#1e293b', fontSize: '15px' }}>Click to Upload Plan</span>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>PNG, JPG or PDF (Max 10MB)</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isAnalyzing && (
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ position: 'absolute', bottom: 0, left: 0, height: '4px', background: 'var(--primary)' }}
                        />
                    )}
                </label>

                <div
                    onClick={() => handleUpdateField('hasNoFloorPlan', !formData.hasNoFloorPlan)}
                    style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        background: formData.hasNoFloorPlan ? 'var(--primary-light)' : '#fff',
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: formData.hasNoFloorPlan ? 'var(--primary)' : '#e2e8f0',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{
                        width: '18px', height: '18px', borderRadius: '4px', border: '2px solid',
                        borderColor: formData.hasNoFloorPlan ? 'var(--primary)' : '#cbd5e1',
                        background: formData.hasNoFloorPlan ? 'var(--primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                    }}>
                        {formData.hasNoFloorPlan && <CheckCircle size={12} />}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: formData.hasNoFloorPlan ? 'var(--primary)' : '#475569' }}>
                        I don't have a floor plan (Estimate from photos)
                    </span>
                </div>
            </div>

            <div style={{ marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', textAlign: 'left' }}>
                <AlertCircle size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
                <div>
                    <span style={{ display: 'block', fontWeight: '800', fontSize: '13px', color: '#1e293b', marginBottom: '2px' }}>Pro Tip</span>
                    <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                        A clear, top-down drawing helps our engine detect door widths, stair counts, and dimensions with millimeter precision.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default FloorPlanStep;
