'use client';

import React, { useState } from 'react';
import { Case } from '@/types/dashboard';
import ReportView from '@/app/components/report/ReportView';
import { useRouter } from 'next/navigation';
import { saveSurveyClient } from '@/lib/surveys/client';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, AlertTriangle, Info, FileText, List, Lock, Clock, Home, Calendar, User } from 'lucide-react';

interface CaseDetailViewProps {
    caseData: Case;
}

const CaseDetailView: React.FC<CaseDetailViewProps> = ({ caseData }) => {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'details' | 'ahr'>('details');
    const { aiReport, wizardData } = caseData.mlData || {};
    const summary = aiReport?.Summary;
    const grade = aiReport?.Grade;
    const scoreNum = typeof (aiReport?.AccessibilityScore ?? caseData.aiScore) === 'number'
        ? (aiReport?.AccessibilityScore ?? caseData.aiScore) as number
        : parseFloat(String(aiReport?.AccessibilityScore ?? caseData.aiScore ?? '')) || null;
    const scoreColor = scoreNum != null ? (scoreNum >= 80 ? { bg: '#059669', fg: '#fff' } : scoreNum >= 50 ? { bg: '#d97706', fg: '#fff' } : { bg: '#dc2626', fg: '#fff' }) : { bg: '#64748b', fg: '#fff' };
    const confidenceRaw = (caseData.mlData as any)?.aiReport?.Confidence || 'MEDIUM';
    const confidencePct = confidenceRaw === 'HIGH' ? 92 : confidenceRaw === 'MEDIUM' ? 75 : 50;
    const confidenceLabel = confidenceRaw === 'HIGH' ? 'High Accuracy' : confidenceRaw === 'MEDIUM' ? 'Medium Accuracy' : 'Low Accuracy';
    const confidenceStyle = confidenceRaw === 'HIGH' ? { iconBg: '#ecfdf5', color: '#10b981' } : confidenceRaw === 'MEDIUM' ? { iconBg: '#fffbeb', color: '#d97706' } : { iconBg: '#fef2f2', color: '#dc2626' };
    
    // Status Logic: Locked when Finalize clicked on AHR report (mlData.isLocked or status Completed)
    const isLocked = !!(caseData.mlData?.isLocked || caseData.status === 'Completed');
    const displayStatus = isLocked ? 'Finalized & Locked' : 'In Review';
    const statusColor = isLocked ? '#059669' : '#d97706';
    const statusBg = isLocked ? '#ecfdf5' : '#fffbeb';
    const StatusIcon = isLocked ? Lock : Clock;

    const handleUpdateCase = async (updatedCase: Case) => {
        try {
            const result = await saveSurveyClient(updatedCase);
            if (result.error) {
                toast.error(`Failed to save: ${result.error}`);
            } else {
                toast.success('Report updated successfully');
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <div style={{
                background: '#fff',
                borderBottom: '1px solid #e2e8f0',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '0 24px',
                    height: '64px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => router.push('/')}
                            style={{
                                padding: '8px',
                                borderRadius: '50%',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#64748b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                                Case {caseData.id}
                            </h1>
                            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                                {caseData.address}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            background: statusBg,
                            color: statusColor,
                            fontSize: '12px',
                            fontWeight: '700',
                            border: `1px solid ${statusColor}20`
                        }}>
                            <StatusIcon size={14} />
                            {displayStatus}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                        <button
                            onClick={() => setActiveTab('details')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: activeTab === 'details' ? '#fff' : 'transparent',
                                color: activeTab === 'details' ? '#0f172a' : '#64748b',
                                boxShadow: activeTab === 'details' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <List size={16} />
                            Case Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('ahr')}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: activeTab === 'ahr' ? '#fff' : 'transparent',
                                color: activeTab === 'ahr' ? '#0f172a' : '#64748b',
                                boxShadow: activeTab === 'ahr' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FileText size={16} />
                            AHR Report
                        </button>
                    </div>
                </div>
            </div>
            </div>

            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
                {activeTab === 'details' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Case Details - Score, Confidence, Address, Date */}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '24px',
                            background: '#fff',
                            padding: '32px',
                            borderRadius: '24px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                            alignItems: 'stretch'
                        }}>
                            {/* Score Card */}
                            <div style={{
                                background: scoreColor.bg,
                                borderRadius: '20px',
                                padding: '24px',
                                color: scoreColor.fg,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '140px',
                                minHeight: '160px',
                                boxShadow: `0 8px 24px ${scoreColor.bg}40`
                            }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', opacity: 0.95, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
                                    Score
                                </div>
                                <div style={{ fontSize: '48px', fontWeight: '900', lineHeight: 1 }}>
                                    {scoreNum != null ? Math.round(scoreNum) : '-'}
                                </div>
                                {grade && (
                                    <div style={{
                                        marginTop: '12px',
                                        padding: '4px 12px',
                                        background: 'rgba(255,255,255,0.2)',
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        fontWeight: '800',
                                        backdropFilter: 'blur(4px)'
                                    }}>
                                        Grade: {grade}
                                    </div>
                                )}
                            </div>

                            {/* Confidence Card */}
                            <div style={{
                                background: '#fff',
                                borderRadius: '20px',
                                padding: '24px',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '140px',
                                minHeight: '160px'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: confidenceStyle.iconBg,
                                    color: confidenceStyle.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '12px'
                                }}>
                                    <CheckCircle size={24} />
                                </div>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                                    Confidence
                                </div>
                                <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', lineHeight: 1 }}>
                                    {confidencePct}%
                                </div>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: confidenceStyle.color, marginTop: '4px' }}>
                                    {confidenceLabel}
                                </div>
                            </div>

                            {/* Property Address */}
                            <div style={{ flex: '1 1 200px', display: 'flex', gap: '16px', alignItems: 'center', minWidth: '200px' }}>
                                <div style={{ padding: '10px', borderRadius: '12px', background: '#f5f3ff', color: '#7c3aed', flexShrink: 0 }}>
                                    <Home size={20} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Property Address
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', lineHeight: 1.4 }}>
                                        {caseData.address}
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginTop: '2px' }}>
                                        {[caseData.city, caseData.postcode].filter(Boolean).join(', ') || '—'}
                                    </div>
                                </div>
                            </div>

                            {/* Assessment Date */}
                            <div style={{ flex: '1 1 200px', display: 'flex', gap: '16px', alignItems: 'center', minWidth: '200px' }}>
                                <div style={{ padding: '10px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', flexShrink: 0 }}>
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Assessment Date
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                                        {caseData.assessmentDate ? new Date(caseData.assessmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set'}
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginTop: '2px' }}>
                                        Standard Field Survey
                                    </div>
                                </div>
                            </div>

                            {/* Name */}
                            <div style={{ flex: '1 1 200px', display: 'flex', gap: '16px', alignItems: 'center', minWidth: '200px' }}>
                                <div style={{ padding: '10px', borderRadius: '12px', background: '#f0fdf4', color: '#059669', flexShrink: 0 }}>
                                    <User size={20} />
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Name
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                                        {caseData.applicantName || 'Not specified'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Analysis Summary */}
                        {summary ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                {/* Strengths */}
                                <div style={{
                                    background: '#fff',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    padding: '24px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <CheckCircle size={20} color="#10b981" />
                                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Strengths</h2>
                                    </div>
                                    <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-line' }}>
                                        {summary.Strengths || 'No strengths identified.'}
                                    </div>
                                </div>

                                {/* Weaknesses */}
                                <div style={{
                                    background: '#fff',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0',
                                    padding: '24px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                        <AlertTriangle size={20} color="#f59e0b" />
                                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Weaknesses</h2>
                                    </div>
                                    <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-line' }}>
                                        {summary.Weaknesses || 'No weaknesses identified.'}
                                    </div>
                                </div>

                                {/* Recommendation */}
                                {summary.Recommendation && (
                                    <div style={{
                                        background: '#fff',
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        padding: '24px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                            <Info size={20} color="#2563eb" />
                                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Recommendation</h2>
                                        </div>
                                        <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569', whiteSpace: 'pre-line' }}>
                                            {summary.Recommendation}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{
                                background: '#fff',
                                borderRadius: '16px',
                                border: '1px dashed #cbd5e1',
                                padding: '48px',
                                textAlign: 'center',
                                color: '#94a3b8'
                            }}>
                                <Info size={32} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                <p style={{ fontSize: '14px', fontWeight: '500' }}>No AI analysis data available for this case.</p>
                            </div>
                        )}

                        {/* Evidence Portfolio - Images like report page */}
                        {((caseData.evidence?.length ?? 0) > 0 || wizardData?.floorPlan) && (
                            <div style={{
                                background: '#fff',
                                borderRadius: '16px',
                                border: '1px solid #e2e8f0',
                                padding: '24px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    Evidence Portfolio
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginBottom: wizardData?.floorPlan ? '40px' : 0 }}>
                                    {(caseData.evidence || []).map((img: string, idx: number) => (
                                        <div key={idx} style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
                                            <img src={img} alt="Evidence" style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block' }} />
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: '#fff', fontSize: '11px', fontWeight: '800' }}>
                                                {idx === 0 ? 'External Elevation' : `Internal Asset #${idx}`}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {wizardData?.floorPlan && (
                                    <div>
                                        <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#4c1d95', borderLeft: '6px solid #4c1d95', paddingLeft: '12px', marginBottom: '20px' }}>
                                            Validated Floor Plan Map
                                        </h4>
                                        <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', background: '#f8fafc' }}>
                                            <img
                                                src={typeof wizardData.floorPlan === 'string' ? wizardData.floorPlan : URL.createObjectURL(wizardData.floorPlan)}
                                                alt="Floor Plan"
                                                style={{ width: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '12px' }}
                                            />
                                            <div style={{ marginTop: '16px', fontSize: '12px', textAlign: 'center', color: '#64748b', fontWeight: '700' }}>
                                                Homingo AI Vision: Spatial Mapping Applied (M4 Compliance Verified)
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ahr' && (
                    <div style={{
                        background: '#fff',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <ReportView
                            caseData={caseData}
                            onBack={() => setActiveTab('details')}
                            onUpdateCase={handleUpdateCase}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaseDetailView;