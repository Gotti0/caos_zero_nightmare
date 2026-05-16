import React, { useState, useEffect, useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area } from 'recharts';
import { Play, Info, Calculator, Trophy, Skull, Sparkles, Shield, Sword, ChevronRight } from 'lucide-react';

const CHAR_MAX = 7; // 명함(1) + 6돌
const WEP_MAX = 5;  // 명함(1) + 4초월

export default function App() {
  const [charCopies, setCharCopies] = useState(1);
  const [wepCopies, setWepCopies] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState(null);

  // 시뮬레이션 엔진 (100,000회 독립 시행)
  const runSimulation = () => {
    setIsSimulating(true);
    
    setTimeout(() => {
      const trials = 100000;
      const pullCounts = new Int32Array(trials);
      let totalPullsSum = 0;

      for (let t = 0; t < trials; t++) {
        let pulls = 0;
        
        // 1. 전투원(캐릭터) 구출 시행
        let charGuaranteed = false;
        for (let i = 0; i < charCopies; i++) {
          let pity = 0;
          while (true) {
            pity++;
            pulls++;
            let rate = pity >= 70 ? 100 : 1 + Math.max(0, pity - 57) * 4.5;
            
            if (Math.random() * 100 < rate) {
              if (charGuaranteed || Math.random() < 0.5) {
                charGuaranteed = false;
                break;
              } else {
                charGuaranteed = true;
                pity = 0;
              }
            }
          }
        }

        // 2. 파트너(무기) 구출 시행 (픽뚫 없음)
        for (let i = 0; i < wepCopies; i++) {
          let pity = 0;
          while (true) {
            pity++;
            pulls++;
            let rate = pity >= 70 ? 100 : 1 + Math.max(0, pity - 57) * 4.5;
            
            if (Math.random() * 100 < rate) {
              break;
            }
          }
        }

        pullCounts[t] = pulls;
        totalPullsSum += pulls;
      }

      pullCounts.sort();
      const avg = totalPullsSum / trials;
      const p10 = pullCounts[Math.floor(trials * 0.10)]; 
      const p50 = pullCounts[Math.floor(trials * 0.50)]; 
      const p90 = pullCounts[Math.floor(trials * 0.90)]; 
      const maxPulls = pullCounts[trials - 1];

      const BUCKET_SIZE = Math.max(5, Math.ceil(maxPulls / 60));
      const bucketsMap = {};
      
      pullCounts.forEach(pull => {
        const bucket = Math.floor(pull / BUCKET_SIZE) * BUCKET_SIZE;
        bucketsMap[bucket] = (bucketsMap[bucket] || 0) + 1;
      });

      let cumulative = 0;
      const chartData = Object.keys(bucketsMap).sort((a, b) => Number(a) - Number(b)).map(bucket => {
        cumulative += bucketsMap[bucket];
        return {
          name: `${bucket}`,
          range: `${bucket}~${Number(bucket) + BUCKET_SIZE - 1}`,
          pulls: Number(bucket),
          count: bucketsMap[bucket],
          cumulativeRate: Number(((cumulative / trials) * 100).toFixed(2))
        };
      });

      setResults({
        avg,
        p10,
        p50,
        p90,
        maxPulls,
        chartData
      });
      setIsSimulating(false);
    }, 100);
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const formatCrystal = (pulls) => {
    return (Math.round(pulls) * 160).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[35%] h-[35%] bg-cyan-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 md:p-10 space-y-8">
        
        {/* 헤더 */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent italic">
                CZN 구출 시뮬레이터
              </h1>
            </div>
            <p className="text-slate-400 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              카오스 제로 나이트매어: 100,000회 연산 기반 정밀 확률 분포 시스템
            </p>
          </div>
          
          <div className="flex gap-3">
             <div className="px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-widest">
               버전 1.0.4 안정화
             </div>
          </div>
        </header>

        {/* 컨트롤 센터 */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 glass-card p-8 rounded-3xl space-y-8">
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-400 uppercase tracking-tighter">
              <Calculator className="w-4 h-4" />
              구출 목표 설정
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 캐릭터 선택 드롭다운 */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 font-bold text-slate-100">
                  <Shield className="w-4 h-4 text-blue-400" />
                  전투원 (캐릭터) 목표
                </label>
                <div className="relative group">
                  <select
                    value={charCopies}
                    onChange={(e) => setCharCopies(Number(e.target.value))}
                    className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-2xl p-4 font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all hover:border-slate-500 shadow-inner"
                  >
                    <option value={1} className="bg-slate-900 text-slate-200">명함 (1장)</option>
                    <option value={2} className="bg-slate-900 text-slate-200">1단계 돌파 (2장)</option>
                    <option value={3} className="bg-slate-900 text-slate-200">2단계 돌파 (3장)</option>
                    <option value={4} className="bg-slate-900 text-slate-200">3단계 돌파 (4장)</option>
                    <option value={5} className="bg-slate-900 text-slate-200">4단계 돌파 (5장)</option>
                    <option value={6} className="bg-slate-900 text-slate-200">5단계 돌파 (6장)</option>
                    <option value={7} className="bg-slate-900 text-slate-200">6단계 돌파 (7장)</option>
                    <option value={8} className="bg-slate-900 text-slate-200">풀단계 돌파 (8장)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-cyan-400 transition-colors">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>

              {/* 무기 선택 드롭다운 */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 font-bold text-slate-100">
                  <Sword className="w-4 h-4 text-purple-400" />
                  파트너 (무기) 목표
                </label>
                <div className="relative group">
                  <select
                    value={wepCopies}
                    onChange={(e) => setWepCopies(Number(e.target.value))}
                    className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-2xl p-4 font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all hover:border-slate-500 shadow-inner"
                  >
                    <option value={0} className="bg-slate-900 text-slate-200">안 뽑음</option>
                    <option value={1} className="bg-slate-900 text-slate-200">명함/깡통 (1장)</option>
                    <option value={2} className="bg-slate-900 text-slate-200">1단계 초월 (2장)</option>
                    <option value={3} className="bg-slate-900 text-slate-200">2단계 초월 (3장)</option>
                    <option value={4} className="bg-slate-900 text-slate-200">3단계 초월 (4장)</option>
                    <option value={5} className="bg-slate-900 text-slate-200">4단계 초월 (5장)</option>
                    <option value={6} className="bg-slate-900 text-slate-200">풀단계 초월 (6장)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-purple-400 transition-colors">
                    <ChevronRight className="w-5 h-5 rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-800 p-5 rounded-2xl transition-all shadow-xl shadow-cyan-900/20 active:scale-[0.98]"
            >
              <div className="relative z-10 flex items-center justify-center gap-3 font-black text-lg tracking-tighter italic text-white">
                {isSimulating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    데이터 분석 중...
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-current" />
                    시뮬레이션 실행
                    <ChevronRight className="w-5 h-5 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </>
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            </button>
          </div>

          <div className="lg:col-span-4 space-y-4">
            {/* 실시간 통계 카드 */}
            <div className="glass-card p-6 rounded-3xl border-l-4 border-l-cyan-500 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
              <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">평균 기댓값</div>
              <div className="text-3xl font-black text-white italic">
                {results ? Math.round(results.avg).toLocaleString() : '---'} <span className="text-sm font-normal text-slate-500 not-italic">회</span>
              </div>
              <div className="mt-2 text-cyan-400 font-mono text-sm font-bold tracking-tight">
                💎 {results ? formatCrystal(results.avg) : '0'} 크리스탈
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border-l-4 border-l-green-500 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
              <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">상위 10% (럭키)</div>
              <div className="text-3xl font-black text-green-400 italic">
                {results ? results.p10.toLocaleString() : '---'} <span className="text-sm font-normal text-slate-500 not-italic">회 이하</span>
              </div>
              <div className="mt-2 text-green-500 font-mono text-sm font-bold tracking-tight">
                💎 {results ? formatCrystal(results.p10) : '0'} 크리스탈
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border-l-4 border-l-red-500 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
              <div className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">하위 10% (폭사)</div>
              <div className="text-3xl font-black text-red-500 italic">
                {results ? results.p90.toLocaleString() : '---'} <span className="text-sm font-normal text-slate-500 not-italic">회 이상</span>
              </div>
              <div className="mt-2 text-red-500 font-mono text-sm font-bold tracking-tight">
                💎 {results ? formatCrystal(results.p90) : '0'} 크리스탈
              </div>
            </div>
          </div>
        </section>

        {/* 데이터 시각화 */}
        {results && (
          <section className="glass-card p-8 rounded-3xl space-y-6 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-black italic flex items-center gap-2 text-white">
                  <div className="w-1.5 h-6 bg-cyan-500 rounded-full"></div>
                  확률 분포 시각화
                </h2>
                <p className="text-sm text-slate-500 font-medium italic">
                  구간별 유저 밀도 및 누적 달성 확률 곡선
                </p>
              </div>
              <div className="flex items-center gap-6 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-700 rounded-sm"></div>
                  <span className="text-slate-400">유저 밀도</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-slate-400">누적 확률 %</span>
                </div>
              </div>
            </div>
            
            <div className="h-[450px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={results.chartData}
                  margin={{ top: 20, right: 10, bottom: 20, left: 0 }}
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#334155" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#1e293b" stopOpacity={0.3}/>
                    </linearGradient>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} 
                    tickMargin={12}
                    axisLine={{ stroke: '#1e293b' }}
                  />
                  
                  <YAxis 
                    yAxisId="left" 
                    tick={{ fill: '#475569', fontSize: 11 }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    domain={[0, 100]} 
                    tick={{ fill: '#8b5cf6', fontSize: 11, fontWeight: 800 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  
                  <Tooltip 
                    cursor={{ stroke: '#334155', strokeWidth: 1 }}
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '16px', 
                      border: '1px solid #334155', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                      padding: '12px'
                    }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px', fontSize: '11px', fontWeight: 'black', fontStyle: 'italic' }}
                    formatter={(value, name, props) => {
                      const pulls = props.payload.pulls;
                      if (name === 'count') {
                        return [
                          <div key="tooltip-content" className="space-y-1">
                            <div>{value.toLocaleString()}명 (유저 밀도)</div>
                            <div className="text-cyan-400">💎 {(pulls * 160).toLocaleString()} 크리스탈</div>
                          </div>,
                          '통계 데이터'
                        ];
                      }
                      if (name === 'cumulativeRate') return [`${value}%`, '누적 달성 확률'];
                      return [value, name];
                    }}
                    labelFormatter={(label) => `${label}회 구출 구간`}
                  />
                  
                  <Bar 
                    yAxisId="left" 
                    dataKey="count" 
                    name="count" 
                    fill="url(#barGradient)" 
                    radius={[6, 6, 0, 0]} 
                    barSize={20}
                  />
                  
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="cumulativeRate" 
                    name="cumulativeRate" 
                    stroke="url(#lineGradient)" 
                    strokeWidth={4}
                    dot={false}
                    activeDot={{ r: 6, fill: "#ec4899", stroke: "#fff", strokeWidth: 2 }}
                  />
                  
                  <ReferenceLine 
                    yAxisId="left" 
                    x={results.chartData.find(d => d.pulls >= results.avg)?.name} 
                    stroke="#0ea5e9" 
                    strokeDasharray="5 5" 
                    strokeWidth={2}
                    label={{ position: 'top', value: '평균', fill: '#0ea5e9', fontSize: 10, fontWeight: 900, fontStyle: 'italic' }} 
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <footer className="text-center space-y-2 pb-10">
          <div className="flex items-center justify-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
            <span>비영리 커뮤니티 도구</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
            <span>데이터 기반 시뮬레이션</span>
          </div>
          <p className="max-w-2xl mx-auto text-[10px] text-slate-600 leading-relaxed font-medium">
            본 시뮬레이터는 게임 내 공시된 확률(5성 1% 시작, 58회부터 보정, 70/140 천장 등)을 바탕으로 제작되었습니다. <br/>
            실제 게임 내에서의 결과는 본 예측과 다를 수 있으며, 본 도구는 오로지 참고용으로만 사용하시기 바랍니다.
          </p>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.25rem;
        }
      `}</style>
    </div>
  );
}
