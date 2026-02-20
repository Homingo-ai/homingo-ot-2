
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
    onAnalyze,
    isAnalyzing,
    analysisComplete
}) => {
    const categoryPhotos = formData.categoryPhotos || {};
    const hasPhotos = Object.values(categoryPhotos).flat().length > 0;

    const removePhoto = (catId: string, photoIndex: number) => {
        const currentCatPhotos = [...(categoryPhotos[catId] || [])];
        currentCatPhotos.splice(photoIndex, 1);

        const updatedCategoryPhotos = { ...categoryPhotos, [catId]: currentCatPhotos };
        handleUpdateField('categoryPhotos', updatedCategoryPhotos);

        // Keep global photos list in sync
        const allCategorizedPhotos = Object.values(updatedCategoryPhotos).flat();
        handleUpdateField('photos', allCategorizedPhotos);

        // Clear validation error when unrelated photo is removed
        onClearValidationError?.(catId);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            style={{ padding: '20px' }}
        >
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
                            Upload up to 3 photos per category for millimetre-perfect AI verification.
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
                {CAPTURE_CATEGORIES.filter(cat => !cat.condition || cat.condition(formData)).map(cat => {
                    const currentPhotos = categoryPhotos[cat.id] || [];
                    const isFull = currentPhotos.length >= 3;
                    const hasError = validationErrors?.[cat.id];

                    const isUploadBlocked = isProcessing || isAnalyzing;

                    return (
                        <div key={cat.id} style={{
                            background: '#fff',
                            borderRadius: '20px',
                            padding: '16px',
                            border: hasError ? '2px solid #facc15' : '1px solid var(--border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            transition: 'all 0.2s',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
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
                                {cat.required && currentPhotos.length === 0 ? (
                                    <span style={{ fontSize: '8px', fontWeight: '900', color: '#ef4444', textTransform: 'uppercase', background: '#fef2f2', padding: '2px 6px', borderRadius: '4px' }}>Required</span>
                                ) : currentPhotos.length > 0 ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#22c55e' }}>
                                        <CheckCircle size={12} />
                                        <span style={{ fontSize: '10px', fontWeight: '800' }}>{currentPhotos.length}/3</span>
                                    </div>
                                ) : null}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                {currentPhotos.map((photo: string, idx: number) => {
                                    return (
                                        <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                            <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button
                                                onClick={() => removePhoto(cat.id, idx)}
                                                disabled={isAnalyzing}
                                                style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: isAnalyzing ? 'not-allowed' : 'pointer', zIndex: 10 }}>
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
                                            multiple={false}
                                            disabled={isUploadBlocked}
                                        />
                                        <Camera size={currentPhotos.length === 0 ? 20 : 16} color="#94a3b8" />
                                        {currentPhotos.length === 0 && <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', marginTop: '4px' }}>Add Photo</span>}
                                    </label>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Analysis Action */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button
                    onClick={onAnalyze}
                    disabled={!hasPhotos || isAnalyzing || isProcessing || analysisComplete}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '16px',
                        background: analysisComplete ? '#dcfce7' : isAnalyzing ? 'var(--primary-light)' : 'var(--primary)',
                        color: analysisComplete ? '#166534' : isAnalyzing ? 'var(--primary)' : '#fff',
                        border: analysisComplete ? '1px solid #bbf7d0' : 'none',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: (!hasPhotos || isAnalyzing || isProcessing || analysisComplete) ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: (!hasPhotos && !isAnalyzing && !analysisComplete) ? 0.6 : 1,
                        transition: 'all 0.2s',
                        boxShadow: analysisComplete ? 'none' : '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}
                >
                    {isAnalyzing ? (
                        <>
                            <RefreshCw className="animate-spin" size={18} />
                            Analyzing Photos...
                        </>
                    ) : analysisComplete ? (
                        <>
                            <CheckCircle size={18} />
                            Analysis Complete
                        </>
                    ) : (
                        <>
                            <RefreshCw size={18} />
                            Analyze Photos
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
};

export default SmartCaptureStep;
