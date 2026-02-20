'use client';

import React, { useState } from 'react';
import Header from '../components/dashboard/Header';
import Dashboard from '../components/dashboard/Dashboard';
import AssessmentWizard from '../components/wizard/AssessmentWizard';
import { Case } from '@/types/dashboard';
import { useRouter } from 'next/navigation';
import { saveSurveyClient } from '@/lib/surveys/client';
import { toast } from 'sonner';

interface DashboardClientProps {
    initialCases: Case[];
    user: { name: string; role: string } | null;
}

export default function DashboardClient({ initialCases, user }: DashboardClientProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [cases, setCases] = useState<Case[]>(initialCases);
    const router = useRouter();

    const handleSelectCase = (id: string) => {
        const selectedCase = cases.find(c => c.id === id);
        if (!selectedCase) return;

        // Navigate to the new case detail page for all cases
        router.push(`/cases/${id}`);
    };

    const handleOpenWizard = () => {
        setIsWizardOpen(true);
    };

    const handleCompleteWizard = async (newCase: Case) => {
        // #region agent log
        fetch('http://127.0.0.1:7776/ingest/358c4c1c-d29f-415a-9f11-2e32b017b478',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'420f70'},body:JSON.stringify({sessionId:'420f70',location:'DashboardClient.tsx:handleCompleteWizard',message:'Wizard completed',data:{newCaseId:newCase?.id,isNumeric:!isNaN(Number(newCase?.id))},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        setIsWizardOpen(false);
        try {
            const result = await saveSurveyClient(newCase);
            if (result.error) {
                toast.error(`Failed to save: ${result.error}`);
                return;
            }
            toast.success('Assessment saved successfully');
            const realId = result.id ?? newCase.id;
            setCases([{ ...newCase, id: realId }, ...cases]);
            router.push(`/cases/${realId}`);
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <div className="app-container">
            <Header
                user={user}
                onOpenWizard={handleOpenWizard}
                onSearch={setSearchTerm}
            />
            <main style={{ minHeight: 'calc(100vh - 80px)' }}>
                <Dashboard
                    user={user}
                    cases={cases}
                    onSelectCase={handleSelectCase}
                    searchTerm={searchTerm}
                />
            </main>
            
            <AssessmentWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onComplete={handleCompleteWizard}
                initialData={null}
                onSaveDraft={(data) => console.log('Draft saved:', data)}
            />
        </div>
    );
}
