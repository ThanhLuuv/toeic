import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { vocabularyService, Vocabulary } from '../services/vocabularyService';
import { toeicService, ToeicQuestion } from '../services/toeicService';

const WORDS_PER_SET = 20;
const SENTENCES_PER_SET = 10;

// Placeholder for Part 1 and Part 2 sets - will be loaded from Firebase
const part1Sets: ToeicQuestion[][] = [];
const part2Sets: ToeicQuestion[][] = [];

const TABS = [
  { key: 'all', label: 'All Categories' },
  { key: 'vocab', label: 'Vocabulary' },
  { key: 'part1', label: 'Sentence (Part 1)' },
  { key: 'part2', label: 'Sentence (Part 2)' },
];

function getSetType(set: any[], isPart1: boolean = false, isPart2: boolean = false) {
  if (isPart1) {
    return '2 words or more';
  }
  if (isPart2) {
    return '2 words or more';
  }
  const hasPhrase = set.some(item => item.word.includes(' '));
  return hasPhrase ? '1 words or more' : '1 word';
}

function getSetTopic(idx: number, isPart1: boolean = false, isPart2: boolean = false) {
  if (isPart1) {
    return 'TOEIC Part 1';
  }
  if (isPart2) {
    return 'TOEIC Part 2';
  }
  if (idx * WORDS_PER_SET < 40) return 'Tourism';
  if (idx * WORDS_PER_SET < 80) return 'Accommodations & Food';
  if (idx * WORDS_PER_SET < 120) return 'Transportation';
  if (idx * WORDS_PER_SET < 160) return 'Stores';
  if (idx * WORDS_PER_SET < 200) return 'Purchase & Warranty';
  if (idx * WORDS_PER_SET < 240) return 'Performance';
  if (idx * WORDS_PER_SET < 280) return 'Exhibition & Museums';
  if (idx * WORDS_PER_SET < 320) return 'Media';
  if (idx * WORDS_PER_SET < 360) return 'Real Estate';
  if (idx * WORDS_PER_SET < 400) return 'Arts';
  return 'Other';
}

const DictationList: React.FC = () => {
  const [tab, setTab] = useState('all');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [completedSets, setCompletedSets] = useState<Set<number>>(new Set());
  const [vocabCompletedSets, setVocabCompletedSets] = useState<Set<number>>(new Set());
  const [part2CompletedSets, setPart2CompletedSets] = useState<Set<number>>(new Set());
  const [vocabSets, setVocabSets] = useState<Vocabulary[][]>([]);
  const [part1Sets, setPart1Sets] = useState<ToeicQuestion[][]>([]);
  const [part2Sets, setPart2Sets] = useState<ToeicQuestion[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Load data from Firebase and completed sets from localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load vocabulary
        const allVocabulary = await vocabularyService.getAllVocabulary(1000);
        const vocabSets: Vocabulary[][] = [];
        for (let i = 0; i < allVocabulary.length; i += WORDS_PER_SET) {
          vocabSets.push(allVocabulary.slice(i, i + WORDS_PER_SET));
        }
        setVocabSets(vocabSets);
        
        // Load Part 1 questions
        const part1Questions = await toeicService.getQuestionsByPart('part1', 1000);
        const part1SetsData: ToeicQuestion[][] = [];
        for (let i = 0; i < part1Questions.length; i += SENTENCES_PER_SET) {
          part1SetsData.push(part1Questions.slice(i, i + SENTENCES_PER_SET));
        }
        setPart1Sets(part1SetsData);
        
        // Load Part 2 questions
        const part2Questions = await toeicService.getQuestionsByPart('part2', 1000);
        const part2SetsData: ToeicQuestion[][] = [];
        for (let i = 0; i < part2Questions.length; i += SENTENCES_PER_SET) {
          part2SetsData.push(part2Questions.slice(i, i + SENTENCES_PER_SET));
        }
        setPart2Sets(part2SetsData);
        
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to empty sets if Firebase fails
        setVocabSets([]);
        setPart1Sets([]);
        setPart2Sets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Load completed sets from localStorage
    const savedCompletedSets = localStorage.getItem('part1-completed-sets');
    if (savedCompletedSets) {
      try {
        const parsed = JSON.parse(savedCompletedSets);
        setCompletedSets(new Set(parsed));
      } catch (e) {
        console.error('Lỗi load completed sets:', e);
      }
    }
    
    const vocabSavedSets = localStorage.getItem('vocab-completed-sets');
    if (vocabSavedSets) {
      try {
        const parsed = JSON.parse(vocabSavedSets);
        setVocabCompletedSets(new Set(parsed));
      } catch (e) {
        console.error('Lỗi load vocab completed sets:', e);
      }
    }

    const part2SavedSets = localStorage.getItem('part2-completed-sets');
    if (part2SavedSets) {
      try {
        const parsed = JSON.parse(part2SavedSets);
        setPart2CompletedSets(new Set(parsed));
      } catch (e) {
        console.error('Lỗi load part2 completed sets:', e);
      }
    }
  }, []);

  // Check URL parameters to set the correct tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && TABS.some(t => t.key === tabParam)) {
      setTab(tabParam);
    }
  }, [location.search]);

  const handleSetClick = (idx: number) => {
    if (tab === 'part1') {
      navigate(`/dictation/part1/${idx}`);
    } else if (tab === 'part2') {
      navigate(`/dictation/part2/${idx}`);
    } else {
      navigate(`/dictation/${idx}`);
    }
  };

  const handleTabClick = (tabKey: string) => {
    setTab(tabKey);
    const params = new URLSearchParams(location.search);
    params.set('tab', tabKey);
    navigate({ search: params.toString() });
  };

  const renderSets = () => {
    if (tab === 'all') {
      // Render all categories
      const allSets = [
        ...vocabSets.map((set, idx) => ({ set, idx, type: 'vocab', originalIdx: idx })),
        ...part1Sets.map((set, idx) => ({ set, idx: idx + vocabSets.length, type: 'part1', originalIdx: idx })),
        ...part2Sets.map((set, idx) => ({ set, idx: idx + vocabSets.length + part1Sets.length, type: 'part2', originalIdx: idx }))
      ];

      const elements = [];
      for (let i = 0; i < allSets.length; i++) {
        const { set, idx, type, originalIdx } = allSets[i];
        elements.push(
          <div
            key={`${type}-${originalIdx}`}
            className={`
              relative rounded-xl p-5 cursor-pointer transition-all duration-300 transform bg-white shadow-lg
              ${hoverIdx === idx 
                ? 'shadow-xl scale-105 -translate-y-1' 
                : 'hover:shadow-xl'
              }
            `}
            onClick={() => {
              if (type === 'part1') {
                navigate(`/dictation/part1/${originalIdx}`);
              } else if (type === 'part2') {
                navigate(`/dictation/part2/${originalIdx}`);
              } else {
                navigate(`/dictation/${originalIdx}`);
              }
            }}
            onMouseEnter={() => setHoverIdx(idx)}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: type === 'vocab' ? '#0284c7' : type === 'part1' ? '#eab308' : '#7c3aed',
                    }}
                  ></div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {type === 'vocab' ? 'Vocabulary' : type === 'part1' ? 'Part 1' : 'Part 2'} - Set {originalIdx + 1}
                  </h3>
                </div>
                {(type === 'vocab' && vocabCompletedSets.has(originalIdx)) ||
                 (type === 'part1' && completedSets.has(originalIdx)) ||
                 (type === 'part2' && part2CompletedSets.has(originalIdx)) ? (
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                    ✓
                  </span>
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-700 font-medium">
                    {type === 'vocab' ? getSetTopic(originalIdx) : 
                     type === 'part1' ? getSetTopic(originalIdx, true) : 
                     getSetTopic(originalIdx, false, true)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-600">
                    {type === 'vocab' ? getSetType(set) : 
                     type === 'part1' ? getSetType(set, true) : 
                     getSetType(set, false, true)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-600">
                    {type === 'vocab' ? `${set.length} words` : 
                     type === 'part1' ? `${set.length} questions` : 
                     `${set.length} questions`}
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <div className="w-full bg-slate-100 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-300 ${
                      (type === 'vocab' && vocabCompletedSets.has(originalIdx)) ||
                      (type === 'part1' && completedSets.has(originalIdx)) ||
                      (type === 'part2' && part2CompletedSets.has(originalIdx)) ? 'bg-green-600 w-full' : 'bg-green-600 w-0'
                    }`}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-1 text-center">
                  {(type === 'vocab' && vocabCompletedSets.has(originalIdx)) ||
                   (type === 'part1' && completedSets.has(originalIdx)) ||
                   (type === 'part2' && part2CompletedSets.has(originalIdx)) ? 'Completed' : 'Start'}
                </p>
              </div>
            </div>
          </div>
        );
        // Sau nhóm Vocabulary
        if (i === vocabSets.length - 1 || i === vocabSets.length + part1Sets.length - 1) {
          elements.push(
            <div
              key={`break-line-${i}`}
              style={{
                gridColumn: '1/-1',
                height: '3px',
                background: '#14B24C',
                borderRadius: '2px',
                margin: '16px 0',
              }}
            ></div>
          );
        }
      }
      return elements;
    } else if (tab === 'vocab') {
      return vocabSets.map((set, idx) => (
        <div
          key={idx}
          className={`
            relative rounded-xl p-5 cursor-pointer transition-all duration-300 transform bg-white shadow-lg
            ${hoverIdx === idx 
              ? 'shadow-xl scale-105 -translate-y-1' 
              : 'hover:shadow-xl'
            }
          `}
          onClick={() => handleSetClick(idx)}
          onMouseEnter={() => setHoverIdx(idx)}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#0284c7' }}
                ></div>
                <h3 className="text-lg font-bold text-slate-800">
                  Set {idx + 1}
                </h3>
              </div>
              {vocabCompletedSets.has(idx) && (
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                  ✓
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-700 font-medium">{getSetTopic(idx)}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-600">{getSetType(set)}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-slate-600">{set.length} words</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="w-full bg-slate-100 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    vocabCompletedSets.has(idx) ? 'bg-green-600 w-full' : 'bg-green-600 w-0'
                  }`}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-1 text-center">
                {vocabCompletedSets.has(idx) ? 'Completed' : 'Start'}
              </p>
            </div>
          </div>
        </div>
      ));
    } else if (tab === 'part1') {
      return part1Sets.map((set, idx) => (
        <div
          key={idx}
          className={`
            relative rounded-xl p-5 cursor-pointer transition-all duration-300 transform bg-white shadow-lg
            ${hoverIdx === idx 
              ? 'shadow-xl scale-105 -translate-y-1' 
              : 'hover:shadow-xl'
            }
          `}
          onClick={() => handleSetClick(idx)}
          onMouseEnter={() => setHoverIdx(idx)}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#eab308' }}
                ></div>
                <h3 className="text-lg font-bold text-slate-800">
                  Set {idx + 1}
                </h3>
              </div>
              {completedSets.has(idx) && (
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                  ✓
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-700 font-medium">{getSetTopic(idx, true)}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-600">{getSetType(set, true)}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-slate-600">{set.length} questions</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="w-full bg-slate-100 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    completedSets.has(idx) ? 'bg-green-600 w-full' : 'bg-green-600 w-0'
                  }`}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-1 text-center">
                {completedSets.has(idx) ? 'Completed' : 'Start'}
              </p>
            </div>
          </div>
        </div>
      ));
    } else if (tab === 'part2') {
      return part2Sets.map((set, idx) => (
        <div
          key={idx}
          className={`
            relative rounded-xl p-5 cursor-pointer transition-all duration-300 transform bg-white shadow-lg
            ${hoverIdx === idx 
              ? 'shadow-xl scale-105 -translate-y-1' 
              : 'hover:shadow-xl'
            }
          `}
          onClick={() => handleSetClick(idx)}
          onMouseEnter={() => setHoverIdx(idx)}
          onMouseLeave={() => setHoverIdx(null)}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: '#7c3aed' }}
                ></div>
                <h3 className="text-lg font-bold text-slate-800">
                  Set {idx + 1}
                </h3>
              </div>
              {part2CompletedSets.has(idx) && (
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                  ✓
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-700 font-medium">{getSetTopic(idx, false, true)}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
                </svg>
                <span className="text-slate-600">{getSetType(set, false, true)}</span>
              </div>

              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-slate-600">{set.length} questions</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="w-full bg-slate-100 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    part2CompletedSets.has(idx) ? 'bg-green-600 w-full' : 'bg-green-600 w-0'
                  }`}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-1 text-center">
                {part2CompletedSets.has(idx) ? 'Completed' : 'Start'}
              </p>
            </div>
          </div>
        </div>
      ));
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Title Section */}
        <div className="text-center mb-4">
          <p className="text-slate-600 text-lg">Practice dictation with vocabulary and sentences</p>
          <div className="mt-4 flex justify-center items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              <span>Multiple practice types</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Progress tracking</span>
            </div>
          </div>
        </div>

        {/* Category Select */}
        <div className="flex justify-start mb-8">
          <div className="relative">
            <select
              value={tab}
              onChange={(e) => handleTabClick(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer"
            >
              {TABS.map(t => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Đang tải...</h3>
            </div>
          </div>
        ) : (tab === 'all' || tab === 'vocab' || tab === 'part1' || tab === 'part2') ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {renderSets()}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Coming Soon</h3>
              <p className="text-slate-600">
                This feature is under development and will be available soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DictationList;