'use client';

import { useEffect, useState } from 'react';
import { StoreHealthScore, FactorScore } from '@/types';
import { TrendingUp, TrendingDown, Minus, AlertCircle, CheckCircle, Award, Sparkles, Activity } from 'lucide-react';

interface StoreHealthDashboardProps {
    healthScore: StoreHealthScore;
}

export default function StoreHealthDashboard({ healthScore }: StoreHealthDashboardProps) {
    const { score, factorDetails } = healthScore;
    const [animatedScore, setAnimatedScore] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    // Animate score on mount
    useEffect(() => {
        setIsVisible(true);
        const duration = 1500;
        const steps = 60;
        const increment = score / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= score) {
                setAnimatedScore(score);
                clearInterval(timer);
            } else {
                setAnimatedScore(current);
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [score]);

    const getScoreColor = (score: number): 'success' | 'orange' | 'warning' | 'danger' => {
        if (score >= 90) return 'success';
        if (score >= 75) return 'orange';
        if (score >= 60) return 'warning';
        return 'danger';
    };

    const getScoreGrade = (score: number) => {
        if (score >= 95) return 'A+';
        if (score >= 90) return 'A';
        if (score >= 85) return 'A-';
        if (score >= 80) return 'B+';
        if (score >= 75) return 'B';
        if (score >= 70) return 'B-';
        if (score >= 65) return 'C+';
        if (score >= 60) return 'C';
        return 'D';
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scoreColor = getScoreColor(score as number);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const grade = getScoreGrade(score as number);

    // Calculate stroke dasharray for circular progress
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

    const colorConfig = {
        success: {
            stroke: '#10B981',
            strokeEnd: '#059669',
            text: 'text-emerald-600',
            bg: 'bg-emerald-50',
            gradeBg: 'bg-emerald-100',
            gradeText: 'text-emerald-800',
            glow: 'shadow-emerald-500/30',
        },
        orange: {
            stroke: '#F59E0B',
            strokeEnd: '#D97706',
            text: 'text-orange-500',
            bg: 'bg-orange-50',
            gradeBg: 'bg-orange-100',
            gradeText: 'text-orange-800',
            glow: 'shadow-orange-500/30',
        },
        warning: {
            stroke: '#EAB308',
            strokeEnd: '#CA8A04',
            text: 'text-yellow-600',
            bg: 'bg-yellow-50',
            gradeBg: 'bg-yellow-100',
            gradeText: 'text-yellow-800',
            glow: 'shadow-yellow-500/30',
        },
        danger: {
            stroke: '#EF4444',
            strokeEnd: '#DC2626',
            text: 'text-red-500',
            bg: 'bg-red-50',
            gradeBg: 'bg-red-100',
            gradeText: 'text-red-800',
            glow: 'shadow-red-500/30',
        },
    };

    const colors = colorConfig[scoreColor];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Main Score Card - Premium Design */}
            <div className={`premium-card relative overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Dynamic Background Gradients */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100/40 via-purple-100/20 to-transparent rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-100/40 via-yellow-100/20 to-transparent rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" />

                <div className="relative z-10 p-6 md:p-10 flex flex-col items-center text-center">
                    {/* Header with Icon */}
                    <div className="flex flex-col items-center gap-2 mb-8 animate-fade-in">
                        <div className={`p-3 rounded-2xl ${colors.bg} mb-2 shadow-sm transform transition-transform hover:scale-110 duration-300`}>
                            <Activity className={`w-8 h-8 ${colors.text}`} />
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">
                            Store Health Score
                        </h2>
                        <p className="text-gray-500 font-medium">Real-time performance metrics</p>
                    </div>

                    {/* Circular Progress */}
                    <div className="relative mb-8 group cursor-default">
                        {/* Outer Glow Effect */}
                        <div
                            className={`absolute inset-0 rounded-full blur-2xl opacity-20 transition-all duration-1000 group-hover:opacity-40 scale-110`}
                            style={{ backgroundColor: colors.stroke }}
                        />

                        <svg className="w-60 h-60 md:w-72 md:h-72 transform -rotate-90 drop-shadow-2xl filter" viewBox="0 0 200 200">
                            {/* Background Circle with Glass Effect */}
                            <circle
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="none"
                                stroke="#F3F4F6"
                                strokeWidth="12"
                                className="opacity-50"
                            />

                            {/* Progress Circle with Gradient */}
                            <circle
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="none"
                                stroke={`url(#scoreGradient-${scoreColor})`}
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-1000 ease-out"
                                style={{
                                    filter: 'drop-shadow(0 0 6px rgba(0, 0, 0, 0.1))',
                                }}
                            />

                            {/* Gradient Definition */}
                            <defs>
                                <linearGradient id={`scoreGradient-${scoreColor}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={colors.stroke} />
                                    <stop offset="50%" stopColor={colors.stroke} />
                                    <stop offset="100%" stopColor={colors.strokeEnd} />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Score Content (Centered Inside Circle) */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center animate-scale-in">
                            <div className="relative flex items-baseline justify-center -mr-2">
                                <span className={`text-[5rem] md:text-[6rem] font-black bg-clip-text text-transparent bg-gradient-to-br from-gray-900 to-gray-600 tracking-tighter leading-none filter drop-shadow-sm`}>
                                    {animatedScore.toFixed(0)}
                                </span>
                                <span className="text-3xl md:text-4xl font-extrabold text-gray-400 ml-0.5">
                                    .{Math.round(animatedScore % 1 * 10)}
                                </span>
                            </div>
                            <span className="text-xs font-bold text-gray-400 mt-0 uppercase tracking-[0.2em]">
                                SCORE / 100
                            </span>

                            {/* Grade Logic */}
                            <div className={`mt-4 px-6 py-1.5 rounded-full ${colors.gradeBg} ${colors.gradeText} ${colors.glow} font-black text-xl md:text-2xl shadow-lg ring-4 ring-white/60 backdrop-blur-md transform transition-transform group-hover:scale-110 duration-500`}>
                                {grade}
                            </div>
                        </div>
                    </div>

                    {/* Status Message */}
                    <div className="max-w-md mx-auto space-y-4">
                        <p className="text-gray-600 text-base md:text-lg font-medium leading-relaxed">
                            {score >= 90 && "🚀 Excellent! Your store is performing exceptionally well."}
                            {score >= 75 && score < 90 && "✨ Good performance! You're on the right track."}
                            {score >= 60 && score < 75 && "⚠️ Your store needs some attention to improve performance."}
                            {score < 60 && "🛑 Critical! Immediate action required to improve store health."}
                        </p>

                        {/* 5-Star Seller Badge */}
                        {score >= 85 && (
                            <div className="inline-block pt-2">
                                <div className="group/badge relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-400 rounded-full blur-md opacity-40 group-hover/badge:opacity-60 transition-opacity animate-pulse-slow" />
                                    <div className="relative flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-50 to-purple-50 border border-primary-200/50 rounded-full">
                                        <Award className="w-5 h-5 text-primary-600" />
                                        <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-purple-700">
                                            Top Rated Seller
                                        </span>
                                        <Sparkles className="w-4 h-4 text-amber-500 animate-spin-slow" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Factor Breakdown */}
            <div className={`premium-card p-6 md:p-8 flex flex-col transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-gray-100">
                    <div className="p-3 bg-primary-50 rounded-2xl shadow-inner">
                        <TrendingUp className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900">Performance Breakdown</h3>
                        <p className="text-sm text-gray-500 font-medium">Detailed factor analysis</p>
                    </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2 max-h-[600px]">
                    {Object.entries(factorDetails).map(([key, factor], index) => (
                        <FactorCard
                            key={key}
                            name={formatFactorName(key)}
                            factor={factor}
                            delay={index * 100}
                            isVisible={isVisible}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

interface FactorCardProps {
    name: string;
    factor: FactorScore;
    delay?: number;
    isVisible?: boolean;
}

function FactorCard({ name, factor, delay = 0, isVisible = true }: FactorCardProps) {
    const getTrendIcon = () => {
        if (factor.trend === 'improving') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
        if (factor.trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    const getBenchmarkConfig = () => {
        if (factor.benchmark === 'excellent') return { color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', bar: 'from-emerald-400 to-emerald-600' };
        if (factor.benchmark === 'good') return { color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', bar: 'from-blue-400 to-blue-600' };
        if (factor.benchmark === 'average') return { color: 'amber', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', bar: 'from-amber-400 to-amber-600' };
        return { color: 'red', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', bar: 'from-red-400 to-red-600' };
    };

    const config = getBenchmarkConfig();
    const progressPercent = (factor.contribution / factor.weightage) * 100;

    return (
        <div
            className={`p-5 rounded-2xl border transition-all duration-500 group hover:shadow-lg hover:-translate-y-1 bg-white ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
            style={{
                transitionDelay: `${delay}ms`,
                borderColor: 'rgba(229, 231, 235, 0.6)'
            }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors text-lg">{name}</h4>
                        <div className="p-1 rounded-full bg-gray-50">{getTrendIcon()}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">Weight: {factor.weightage}%</span>
                        <span>•</span>
                        <span>Contr: {factor.contribution.toFixed(1)}</span>
                    </div>
                </div>
                <span className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border ${config.bg} ${config.text} ${config.border}`}>
                    {factor.benchmark}
                </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-500 font-medium">Performance</span>
                    <span className="font-bold text-gray-900">
                        {Math.round((factor.value / 100) * 100)}%
                    </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden p-[2px]">
                    <div
                        className={`h-full bg-gradient-to-r ${config.bar} rounded-full transition-all duration-1000 ease-out relative overflow-hidden shadow-sm`}
                        style={{ width: `${progressPercent}%` }}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    </div>
                </div>
            </div>

            {/* Tip */}
            {factor.tip && (
                <div className="flex items-start gap-3 text-sm text-gray-600 bg-gray-50/80 p-4 rounded-xl border border-gray-100 group-hover:bg-primary-50/30 group-hover:border-primary-100/50 transition-colors">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary-500" />
                    <span className="leading-relaxed font-medium">{factor.tip}</span>
                </div>
            )}
        </div>
    );
}

function formatFactorName(key: string): string {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
}
