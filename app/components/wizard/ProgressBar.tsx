
import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressBarProps {
    currentStep: number;
    steps: { id: number; title: string; icon: React.ReactNode }[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, steps }) => {
    return (
        <div style={{
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '6px',
            position: 'sticky',
            top: 0,
            zIndex: 10
        }}>
            {steps.map((s, idx) => {
                const isActive = s.id === currentStep;
                const isCompleted = s.id < currentStep;

                return (
                    <React.Fragment key={s.id}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            flex: 1,
                            position: 'relative',
                            minHeight: '48px',
                            justifyContent: 'flex-start'
                        }}>
                            <motion.div
                                animate={{
                                    scale: isActive ? 1.05 : 1,
                                    background: isCompleted ? '#22c55e' : isActive ? 'var(--primary)' : '#fff',
                                    borderColor: isCompleted ? '#22c55e' : isActive ? 'var(--primary)' : '#e2e8f0',
                                    color: isCompleted || isActive ? '#fff' : '#94a3b8'
                                }}
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '8px',
                                    border: '2px solid',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 2,
                                    boxShadow: isActive ? '0 0 10px rgba(99, 102, 241, 0.15)' : 'none'
                                }}
                            >
                                {isCompleted ? <Check size={14} strokeWidth={3} /> : React.isValidElement(s.icon) ? React.cloneElement(s.icon as React.ReactElement<any>, { size: 14 }) : s.icon}
                            </motion.div>

                            <span style={{
                                fontSize: '8.5px',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.4px',
                                color: isActive ? 'var(--primary)' : isCompleted ? '#22c55e' : '#94a3b8',
                                textAlign: 'center',
                                maxWidth: '60px',
                                minHeight: '14px',
                                lineHeight: '14px'
                            }}>
                                {s.title}
                            </span>
                        </div>
                        {idx < steps.length - 1 && (
                            <div style={{
                                flex: 1,
                                height: '2px',
                                marginTop: '13px',
                                background: '#e2e8f0',
                                borderRadius: '2px',
                                overflow: 'hidden',
                                flexShrink: 0
                            }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: isCompleted ? '100%' : '0%' }}
                                    style={{ height: '100%', background: '#22c55e' }}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default ProgressBar;
