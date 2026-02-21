
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image as ImageIcon, Trash2, CheckCircle, Info, Plus, RefreshCw } from 'lucide-react';
import { WizardStepProps } from '../types';

const CAPTURE_CATEGORIES = [
    { id: 'entrance', title: 'Main Entrance', desc: 'Door and structural steps.', required: true },
    { id: 'hallway', title: 'Hallway', desc: 'Long shot showing width.', required: true },
    { id: 'stairs', title: 'Internal Stairs', desc: 'From bottom looking up.', condition: (d: any) => d.internalStairs === 'Yes' },
    { id: 'kitchen', title: 'Kitchen', desc: 'Floor space and turning circle.', required: true },
    { id: 'bathroom', title: 'Bathroom', desc: 'Toilet space and shower type.', required: true },
    { id: 'garden', title: 'Garden Access', desc: 'Door threshold to garden.', condition: (d: any) => d.gardenAccess === 'Yes' || d.propertyAccessGarden === 'Yes' },
];

const SmartCaptureStep: React.FC<WizardStepProps> = ({
    formData,
    handleUpdateField,
    handlePhotoUpload,
    isProcessing,
    processingCategory,
    validationErrors,
    onClearValidationError,
    isAnalyzing,
    analysisComplete,
    categoryResults,
    onPhotosChanged,
}) => {
    const categoryPhotos = formData.categoryPhotos || {};

    const removePhoto = (catId: string, photoIndex: number) => {
        const currentCatPhotos = [...(categoryPhotos[catId] || [])];
        currentCatPhotos.splice(photoIndex, 1);

        const updatedCategoryPhotos = { ...categoryPhotos, [catId]: currentCatPhotos };
        handleUpdateField('categoryPhotos', updatedCategoryPhotos);

        // Keep global photos list in sync
        const allCategorizedPhotos = Object.values(updatedCategoryPhotos).flat();
        handleUpdateField('photos', allCategorizedPhotos);

        // Clear validation error and reset analysis state so Analyze is required again
        onClearValidationError?.(catId);
        onPhotosChanged?.();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            style={{ padding: '20px', position: 'relative' }}
        >
            <AnimatePresence>
                {isAnalyzing && (
                    <motion.div
                        key="analyzing-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(99, 102, 241, 0.08)',
                            backdropFilter: 'blur(2px)',
                            borderRadius: '16px',
                            zIndex: 20,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '16px',
                            pointerEvents: 'all',
                        }}
                    >
                        <div style={{
                            background: '#fff',
                            borderRadius: '20px',
                            padding: '28px 36px',
                            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.18)',
                            border: '1px solid rgba(99, 102, 241, 0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '14px',
                            minWidth: '220px',
                        }}>
                            <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    borderRadius: '50%',
                                    border: '3px solid #eef2ff',
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    borderRadius: '50%',
                                    border: '3px solid transparent',
                                    borderTopColor: '#6366f1',
                                    animation: 'spin 0.8s linear infinite',
                                }} />
                                <div style={{
                                    position: 'absolute',
                                    inset: '10px',
                                    borderRadius: '50%',
                                    background: '#eef2ff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Camera size={14} color="#6366f1" />
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontWeight: '800', fontSize: '15px', color: '#6366f1', marginBottom: '4px' }}>
                                    Analysing Photos
                                </p>
                                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>
                                    AI is verifying your evidence&hellip;
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{
                                        width: '7px',
                                        height: '7px',
                                        borderRadius: '50%',
                                        background: '#6366f1',
                                        animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                                    }} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <div style={{ padding: '2px 8px', background: 'var(--primary)', color: '#fff', borderRadius: '4px', fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Guided Evidence
                            </div>
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '2px', color: 'var(--primary)' }}>Smart Capture</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '13px' }}>
                            Upload photos per category for millimetre-perfect AI verification.
                        </p>
                    </div>
                    {isProcessing && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--primary-light)', borderRadius: '10px', color: 'var(--primary)', fontWeight: '700', fontSize: '12px' }}>
                            <RefreshCw className="animate-spin" size={14} />
                            Uploading...
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {CAPTURE_CATEGORIES.map(cat => {
                    const currentPhotos = categoryPhotos[cat.id] || [];
                    const isFull = currentPhotos.length >= 3;
                    const hasError = validationErrors?.[cat.id];
                    const analysisResult = categoryResults?.[cat.id];

                    const isUploadBlocked = isProcessing || isAnalyzing || analysisComplete;

                    const cardBorder = analysisResult === 'valid'
                        ? '2px solid #22c55e'
                        : analysisResult === 'invalid' || hasError
                        ? '2px solid #facc15'
                        : '1px solid var(--border)';

                    return (
                        <div key={cat.id} style={{
                            background: '#fff',
                            borderRadius: '20px',
                            padding: '16px',
                            border: cardBorder,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            transition: 'border 0.3s',
                            boxShadow: analysisResult === 'valid'
                                ? '0 2px 10px rgba(34,197,94,0.08)'
                                : analysisResult === 'invalid'
                                ? '0 2px 10px rgba(250,204,21,0.1)'
                                : '0 2px 10px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {cat.title}
                                        {cat.required && <span style={{ color: '#ef4444', fontSize: '12px' }} title="Required">*</span>}
                                    </h4>
                                    <p style={{ fontSize: '11px', color: '#64748b' }}>{cat.desc}</p>
                                    {hasError && (
                                        <div style={{ 
                                            marginTop: '4px', 
                                            fontSize: '10px', 
                                            color: '#ca8a04', 
                                            fontWeight: '700' 
                                        }}>
                                            ⚠️ Unrelated photo
                                        </div>
                                    )}
                                </div>
                                {analysisResult === 'valid' ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', background: '#dcfce7', padding: '2px 7px', borderRadius: '6px' }}>
                                        <CheckCircle size={11} />
                                        <span style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}>Verified</span>
                                    </div>
                                ) : analysisResult === 'invalid' ? (
                                    <span style={{ fontSize: '8px', fontWeight: '900', color: '#92400e', textTransform: 'uppercase', background: '#fef9c3', padding: '2px 6px', borderRadius: '4px' }}>⚠ Review</span>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {cat.required && currentPhotos.length === 0 && (
                                            <span style={{ fontSize: '8px', fontWeight: '900', color: '#ef4444', textTransform: 'uppercase', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>Required</span>
                                        )}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: currentPhotos.length > 0 ? '#22c55e' : '#94a3b8' }}>
                                            {currentPhotos.length > 0 && <CheckCircle size={12} />}
                                            <span style={{ fontSize: '10px', fontWeight: '800' }}>{currentPhotos.length}/3</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                {currentPhotos.map((photo: string, idx: number) => {
                                    return (
                                        <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                            <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button
                                                onClick={() => removePhoto(cat.id, idx)}
                                                disabled={isAnalyzing || analysisComplete}
                                                style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: (isAnalyzing || analysisComplete) ? 'not-allowed' : 'pointer', zIndex: 10 }}>
                                                <Trash2 size={10} />
                                            </button>
                                        </div>
                                    );
                                })}
                                {!isFull && (
                                    <label style={{
                                        position: 'relative',
                                        aspectRatio: '1',
                                        background: '#f8fafc',
                                        borderRadius: '8px',
                                        border: '1px dashed #cbd5e1',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: isUploadBlocked ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        gridColumn: currentPhotos.length === 0 ? 'span 3' : 'span 1',
                                        height: currentPhotos.length === 0 ? '80px' : 'auto',
                                        opacity: isUploadBlocked ? 0.7 : 1
                                    }}
                                        onMouseEnter={(e) => !isUploadBlocked && (e.currentTarget.style.borderColor = 'var(--primary)', e.currentTarget.style.background = 'var(--primary-light)')}
                                        onMouseLeave={(e) => !isUploadBlocked && (e.currentTarget.style.borderColor = '#cbd5e1', e.currentTarget.style.background = '#f8fafc')}
                                    >
                                        {isUploadBlocked && (
                                            <div style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'rgba(148, 163, 184, 0.4)',
                                                borderRadius: '8px',
                                                zIndex: 10,
                                                cursor: 'not-allowed',
                                                pointerEvents: 'auto'
                                            }} />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            hidden
                                            onChange={(e) => handlePhotoUpload && handlePhotoUpload(e, cat.id)}
                                            multiple
                                            disabled={isUploadBlocked}
                                        />
                                        <Camera size={currentPhotos.length === 0 ? 20 : 16} color="#94a3b8" />
                                        {currentPhotos.length === 0 && <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginTop: '4px' }}>Add Photos</span>}
                                    </label>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

export default SmartCaptureStep;
