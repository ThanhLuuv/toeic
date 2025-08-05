import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { vocabularyService, Vocabulary } from '../services/vocabularyService';

const WORDS_PER_SET = 20;

function getSetType(set: any[]) {
  const hasPhrase = set.some(item => item.word.includes(' '));
  return hasPhrase ? '1 words or more' : '1 word';
}

// Interface for vocabulary sets grouped by topic
interface VocabSetByTopic {
  topic: string;
  sets: Vocabulary[][];
}

const DictationList: React.FC = () => {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [vocabCompletedSets, setVocabCompletedSets] = useState<Set<number>>(new Set());
  const [vocabSetsByTopic, setVocabSetsByTopic] = useState<VocabSetByTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Load data from Firebase and completed sets from localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load vocabulary and group by topic
        const topics = await vocabularyService.getAllTopics();
        console.log('Available topics:', topics);
        
        const vocabSetsByTopicData: VocabSetByTopic[] = [];
        
        // Process each topic using getVocabularyByTopic for better filtering
        for (const topic of topics) {
          try {
            // Get vocabulary by topic directly from database
            const topicVocabulary = await vocabularyService.getVocabularyByTopic(topic, 1000);
            console.log(`Topic "${topic}" has ${topicVocabulary.length} words:`, topicVocabulary.slice(0, 5));
            
            if (topicVocabulary.length > 0) {
              // Remove duplicates (case-insensitive)
              const uniqueVocabulary = topicVocabulary.filter((vocab, index, self) => 
                index === self.findIndex(v => v.word.toLowerCase() === vocab.word.toLowerCase())
              );
              
              console.log(`Topic "${topic}" has ${uniqueVocabulary.length} unique words after deduplication`);
              
              const sets: Vocabulary[][] = [];
              
              // Create sets of WORDS_PER_SET words
              for (let i = 0; i < uniqueVocabulary.length; i += WORDS_PER_SET) {
                const set = uniqueVocabulary.slice(i, i + WORDS_PER_SET);
                if (set.length > 0) {
                  sets.push(set);
                  console.log(`Set ${sets.length} for topic "${topic}":`, set.map(v => v.word));
                }
              }
              
              if (sets.length > 0) {
                vocabSetsByTopicData.push({ topic, sets });
              }
            }
          } catch (error) {
            console.error(`Error loading vocabulary for topic "${topic}":`, error);
          }
        }
        
        // Add vocabulary without topic to "Other" category
        try {
          const allVocabulary = await vocabularyService.getAllVocabulary(1000);
          const vocabWithoutTopic = allVocabulary
            .filter(vocab => !vocab.topic)
            .filter((vocab, index, self) => 
              index === self.findIndex(v => v.word.toLowerCase() === vocab.word.toLowerCase())
            );
          
          console.log(`Found ${vocabWithoutTopic.length} words without topic`);
          
          if (vocabWithoutTopic.length > 0) {
            const otherSets: Vocabulary[][] = [];
            for (let i = 0; i < vocabWithoutTopic.length; i += WORDS_PER_SET) {
              const set = vocabWithoutTopic.slice(i, i + WORDS_PER_SET);
              if (set.length > 0) {
                otherSets.push(set);
                console.log(`Other set ${otherSets.length}:`, set.map(v => v.word));
              }
            }
            if (otherSets.length > 0) {
              vocabSetsByTopicData.push({ topic: 'Other', sets: otherSets });
            }
          }
        } catch (error) {
          console.error('Error loading vocabulary without topic:', error);
        }
        
        console.log('Final vocabulary sets by topic:', vocabSetsByTopicData);
        setVocabSetsByTopic(vocabSetsByTopicData);
        
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback to empty sets if Firebase fails
        setVocabSetsByTopic([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Load completed sets from localStorage
    const vocabSavedSets = localStorage.getItem('vocab-completed-sets');
    if (vocabSavedSets) {
      try {
        const parsed = JSON.parse(vocabSavedSets);
        setVocabCompletedSets(new Set(parsed));
      } catch (e) {
        console.error('Lỗi load vocab completed sets:', e);
      }
    }
  }, []);

  const handleSetClick = (idx: number, topicIndex?: number, setIndex?: number) => {
    console.log(`handleSetClick: idx=${idx}, topicIndex=${topicIndex}, setIndex=${setIndex}`);
    
    if (topicIndex !== undefined && setIndex !== undefined) {
      // Use the global index calculated from topic and set
      const globalIdx = getGlobalVocabIndex(topicIndex, setIndex);
      console.log(`Navigating to vocabulary set: /dictation/${globalIdx}`);
      navigate(`/dictation/${globalIdx}`);
    } else {
      navigate(`/dictation/${idx}`);
    }
  };

  // Helper function to get global index for vocabulary sets
  const getGlobalVocabIndex = (topicIndex: number, setIndex: number): number => {
    let globalIndex = 0;
    for (let i = 0; i < topicIndex; i++) {
      globalIndex += vocabSetsByTopic[i].sets.length;
    }
    const result = globalIndex + setIndex;
    console.log(`getGlobalVocabIndex: topicIndex=${topicIndex}, setIndex=${setIndex}, result=${result}`);
    console.log(`Topic "${vocabSetsByTopic[topicIndex]?.topic}" set ${setIndex + 1} -> global index ${result}`);
    return result;
  };

  const renderSets = () => {
    // Render all vocabulary categories
    const allSets: Array<{
      set: Vocabulary[];
      idx: number;
      originalIdx: number;
      topic?: string;
    }> = [];
    
    // Add vocabulary sets by topic
    vocabSetsByTopic.forEach((topicData, topicIndex) => {
      topicData.sets.forEach((set, setIndex) => {
        const globalIdx = getGlobalVocabIndex(topicIndex, setIndex);
        console.log(`Adding to allSets: topic="${topicData.topic}" set ${setIndex + 1} -> globalIdx=${globalIdx}`);
        allSets.push({
          set,
          idx: allSets.length,
          originalIdx: globalIdx,
          topic: topicData.topic
        });
      });
    });

    const elements: React.ReactElement[] = [];
    for (let i = 0; i < allSets.length; i++) {
      const { set, idx, originalIdx, topic } = allSets[i];
      elements.push(
        <div
          key={`vocab-${originalIdx}`}
          className={`
            relative rounded-xl p-5 cursor-pointer transition-all duration-300 transform bg-white shadow-lg
            ${hoverIdx === idx 
              ? 'shadow-xl scale-105 -translate-y-1' 
              : 'hover:shadow-xl'
            }
          `}
          onClick={() => {
            console.log(`Clicking on vocab set: topic="${topic}", originalIdx=${originalIdx}`);
            console.log(`Navigating to vocabulary: /dictation/${originalIdx}`);
            navigate(`/dictation/${originalIdx}`);
          }}
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
                  Vocabulary - Set {originalIdx + 1}
                </h3>
              </div>
              {vocabCompletedSets.has(originalIdx) && (
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
                <span className="text-slate-700 font-medium">{topic}</span>
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
                    vocabCompletedSets.has(originalIdx) ? 'bg-green-600 w-full' : 'bg-green-600 w-0'
                  }`}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-1 text-center">
                {vocabCompletedSets.has(originalIdx) ? 'Completed' : 'Start'}
              </p>
            </div>
          </div>
        </div>
             );
    }
    return elements;
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Title Section */}
        <div className="text-center mb-4">
          <p className="text-slate-600 text-lg">Practice dictation with vocabulary</p>
          <div className="mt-4 flex justify-center items-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1v-2h-1zm-2-2H7v4h6v-4z" clipRule="evenodd" />
              </svg>
              <span>Vocabulary practice</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Progress tracking</span>
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {renderSets()}
          </div>
        )}
      </div>
    </div>
  );
};

export default DictationList;