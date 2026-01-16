'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import InlineChat from './components/InlineChat';

const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:3001';
const TENANT_ID = 'exactly-homepage';

export default function ExactlyLandingFinal() {
  const [hoveredCTAs, setHoveredCTAs] = useState<Record<string, boolean>>({});
  const [heroButtonHovered, setHeroButtonHovered] = useState(false);
  const [heroButtonActive, setHeroButtonActive] = useState(false);
  const [hoveredPills, setHoveredPills] = useState<Record<string, boolean>>({});
  const [activePills, setActivePills] = useState<Record<string, boolean>>({});
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderFade, setPlaceholderFade] = useState(true);
  const [inputFocused, setInputFocused] = useState(false);

  // Chat state - persisted until page refresh
  const [chatActive, setChatActive] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState('');
  const [chatSessionId] = useState(() => typeof crypto !== 'undefined' ? crypto.randomUUID() : '');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const heroInputRef = useRef<HTMLInputElement>(null);

  const placeholderMessages = [
    "What on my homepage might be costing me leads?",
    "How can AI grow my business specifically?",
    "What can Exactly do for my business?",
    "How can I lower overhead without slowing growth?",
    "I need more traffic from AI search."
  ];

  // Function to start the chat with a message
  const startChat = useCallback((message: string) => {
    // Only set initial message if no messages exist yet
    if (chatMessages.length === 0) {
      setInitialChatMessage(message);
    }
    setChatActive(true);
  }, [chatMessages.length]);

  // Function to close the chat (preserves session)
  const closeChat = useCallback(() => {
    setChatActive(false);
    // Don't reset messages or session - they persist until page refresh
  }, []);

  // Handle ASK button or Enter key - get input value and start chat
  const handleAskSubmit = useCallback(() => {
    const inputValue = heroInputRef.current?.value || '';
    const message = inputValue.trim() || placeholderMessages[placeholderIndex];
    startChat(message);
  }, [placeholderIndex, placeholderMessages, startChat]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderFade(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholderMessages.length);
        setPlaceholderFade(true);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const setHovered = (id: string, value: boolean) => {
    setHoveredCTAs(prev => ({ ...prev, [id]: value }));
  };

  const setPillHovered = (id: string, value: boolean) => {
    setHoveredPills(prev => ({ ...prev, [id]: value }));
  };

  const setPillActive = (id: string, value: boolean) => {
    setActivePills(prev => ({ ...prev, [id]: value }));
  };

  const ChatIcon = ({ color = '#4C1D95', size = 17 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );

  const CTAPill = ({ id, ctaText }: { id: string; ctaText: string }) => (
    <div style={{ marginTop: '56px' }}>
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); startChat(ctaText); }}
        onMouseEnter={() => setHovered(id, true)}
        onMouseLeave={() => setHovered(id, false)}
        style={{
          background: hoveredCTAs[id]
            ? '#FFFFFF'
            : '#FF6B35',
          border: hoveredCTAs[id] ? '2px solid #FF6B35' : 'none',
          color: hoveredCTAs[id] ? '#FF6B35' : '#FFFFFF',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: '500',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
          padding: hoveredCTAs[id] ? '10px 20px' : '12px 22px',
          borderRadius: '24px',
          cursor: 'pointer',
          transition: 'all 0.25s ease',
          boxShadow: hoveredCTAs[id]
            ? 'none'
            : '0 6px 20px rgba(255, 107, 53, 0.4)'
        }}
      >
        <ChatIcon color={hoveredCTAs[id] ? '#FF6B35' : '#FFFFFF'} size={17} />
        {hoveredCTAs[id] ? 'Open chat' : ctaText}
        <span style={{ fontSize: '15px' }}>→</span>
      </a>
    </div>
  );

  const faqs = [
    {
      id: 'faq1',
      question: "Who is Exactly, and what makes you so different?",
      leadIn: "Exactly AI Solutions builds and runs agentic systems that guarantee outcomes.",
      content: [
        "<strong style='font-weight: 700;'>Most companies sell tools.</strong> You pay, your team experiments, <strong style='font-weight: 700;'>results depend on effort.</strong>",
        "We <strong>build, run, and optimize</strong> it for you — and only collect when your <strong>growth targets are met</strong>. That's <strong>Outcomes-as-a-Service</strong>.",
        "Want proof? You don't need to take our word for it. In less than a minute, you can watch our <strong>AI analyze your company</strong> — no login, no email."
      ],
      cta: "Show me your AI"
    },
    {
      id: 'faq2',
      question: "What can you actually do for my business?",
      leadIn: "We increase revenue and lower operating costs — without adding headcount.",
      content: [
        "Our AI agents find the right companies and contacts, run outbound across every channel, and <strong>optimize everything that affects your growth</strong> — from messaging to conversion.",
        "Leads come in ready. Outreach scales automatically. <strong>Sales enablement gets sharper</strong> with every conversation.",
        "Search visibility improves too — across SEO, AEO, and GEO — for every type of search.",
        "Every <strong>agentic workflow is built specifically for your business</strong> — not a template, not plug-and-play."
      ],
      cta: "What would this look like for my business?"
    },
    {
      id: 'faq3',
      question: "How can you guarantee outcomes when others can't?",
      leadIn: "Because we're built differently — by design.",
      content: [
        "That's why we're not SaaS. We don't rely on users. <strong>Our AI agents do the work.</strong>",
        "They're constantly working, communicating, testing, and improving — <strong>almost in real time.</strong> They operate around the clock to achieve the goals we promise to deliver.",
        "<strong>No other system to date can do that.</strong>"
      ],
      cta: "Tell me more about guaranteed outcomes"
    },
    {
      id: 'faq4',
      question: "So how do guaranteed outcomes work?<br/>I need details.",
      leadIn: "Every engagement starts with defined outcomes and a clear roadmap to reach them.",
      content: [
        "<strong>Revenue growth. Efficiency gains. Higher revenue per full-time employee.</strong> Outcomes that actually move the business — not surface KPIs.",
        "A simple 20% refundable engagement deposit gets us started, and our agents go to work — <strong>executing, testing, and improving in real time</strong> across every channel that drives performance.",
        "When outcomes are achieved, the balance is collected. If we deliver part of the improvement, payment scales accordingly. If no measurable results are achieved, <strong>the deposit is refunded in full.</strong>",
        "That's the beauty of true Outcomes-as-a-Service. <strong>Our goals are perfectly aligned.</strong>"
      ],
      cta: "Walk me through the process"
    },
    {
      id: 'faq5',
      question: "Will it work for my business?",
      leadIn: "Eventually, we'll be right for everyone — but not yet.",
      content: [
        "Today, if you're a <strong>U.S.-based B2B company between $10M–$1B in revenue</strong>, or a funded startup with ambition, there's probably mutual fit.",
        "Exactly's systems adapt to your market, sales cycle, and brand. <strong>Industry doesn't matter</strong> — what does is readiness, and belief in what AI can do for you.",
        "You can test that readiness — and instantly see where AI could help your business most with our <strong>AI Readiness and Opportunities Report</strong>, a 2,000-word deep dive that consultants would charge thousands for, delivered to your inbox in 10 minutes — for free."
      ],
      cta: "What are my AI opportunities?"
    },
    {
      id: 'faq6',
      question: "How do I get started?",
      leadIn: "The best way is to experience our AI right now.<br/>Get an Instant Report - under 10 seconds, no sign-up.",
      content: [
        "Just pick an analysis, give us your company name, and <strong>watch the AI work:</strong>"
      ],
      bullets: [
        "<strong>Overhead Check</strong> — See where AI could lower your operating costs right now.",
        "<strong>Homepage CRO Review</strong> — Get a quick take on how well your homepage converts visitors.",
        "<strong>Brand Reputation Snapshot</strong> — How your company looks across search and social, instantly.",
        "<strong>AI in Your Industry</strong> — See what competitors are already automating."
      ],
      contentAfter: "And there are 4 more. Every insight is generated live — <strong>proof you can see, not a promise you have to believe.</strong>",
      cta: "Get an Instant Report"
    },
    {
      id: 'faq7',
      question: "What if I wanted a smart AI chatbot like this for my website?",
      leadIn: "You can.",
      content: [
        "<strong>We build engaging AI chatbots</strong> for real websites, designed around your business and what you want the chatbot to handle — <strong>answering questions, guiding visitors, capturing leads, booking meetings, and improving conversion rates. It's all done-for-you.</strong>",
        "If you're curious what this could look like for your site, you can request a chatbot demo below."
      ],
      cta: "Show me a chatbot for my site"
    },
    {
      id: 'faq8',
      question: "This does make a lot of sense, but I still have some questions?",
      leadIn: "Great. We love questions — and we really want to know what's on your mind.",
      content: [
        "That's why we created what we think is a <strong>really cool chatbot.</strong>",
        "So go ahead. <strong>Ask us anything.</strong> We'll do our best to answer — and help."
      ],
      cta: "Ask anything"
    },
    {
      id: 'faq9',
      question: "So what happens next?",
      leadIn: "When you're ready to take the next step, we'll schedule your AI Growth Kickoff — a short, focused meeting where we look at your company, your goals, and the outcomes worth pursuing.",
      content: [
        "You'll see <strong>projected improvements, timelines, and how the refundable engagement deposit works</strong> — everything you need to decide if it's a fit.",
        "No pitch deck. No pressure. Just <strong>clarity on what's possible, and how fast we can make it happen.</strong>"
      ],
      cta: "Schedule my AI Growth Kickoff"
    }
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        
        html {
          scroll-behavior: smooth;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.8;
          }
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        background: '#FEFEFE',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>

        {/* ============ HERO SECTION ============ */}
        <div style={{ position: 'relative', minHeight: '680px', overflow: 'hidden' }}>
          {/* Main gradient background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 120% 100% at 100% 100%, rgba(0, 170, 230, 0.5) 0%, transparent 50%),
              radial-gradient(ellipse 140% 120% at 95% 95%, rgba(0, 130, 210, 0.7) 0%, transparent 55%),
              radial-gradient(ellipse 160% 140% at 90% 100%, rgba(40, 80, 190, 0.65) 0%, transparent 60%),
              radial-gradient(ellipse 180% 160% at 85% 105%, rgba(80, 55, 165, 0.55) 0%, transparent 65%),
              radial-gradient(ellipse 200% 180% at 80% 110%, rgba(110, 45, 145, 0.45) 0%, transparent 70%),
              radial-gradient(ellipse 100% 90% at 20% 30%, rgba(60, 100, 200, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse 80% 70% at 50% 60%, rgba(100, 70, 180, 0.2) 0%, transparent 45%),
              radial-gradient(ellipse 110% 95% at 70% 40%, rgba(30, 120, 200, 0.18) 0%, transparent 48%),
              linear-gradient(180deg, #001830 0%, #001225 50%, #001a30 100%)
            `
          }} />
          
          {/* Radiating expansion lines overlay with curves */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='1200' height='800' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='lines' width='1200' height='800' patternUnits='userSpaceOnUse'%3E%3Cg stroke='%23FF8F5C' stroke-width='1.5' opacity='0.08' fill='none'%3E%3Cpath d='M 0 800 Q 200 600 400 0'/%3E%3Cpath d='M 0 800 Q 250 550 500 0'/%3E%3Cpath d='M 0 800 Q 300 500 600 0'/%3E%3Cpath d='M 0 800 Q 350 450 700 0'/%3E%3Cpath d='M 0 800 Q 400 400 800 0'/%3E%3Cpath d='M 0 800 Q 450 350 900 0'/%3E%3Cpath d='M 0 800 Q 500 300 1000 0'/%3E%3Cpath d='M 0 800 Q 550 250 1100 0'/%3E%3Cpath d='M 0 800 Q 600 200 1200 0'/%3E%3Cpath d='M 0 800 Q 700 300 1200 100'/%3E%3Cpath d='M 0 800 Q 800 400 1200 200'/%3E%3Cpath d='M 0 800 Q 900 500 1200 300'/%3E%3Cpath d='M 0 800 Q 1000 600 1200 400'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23lines)'/%3E%3C/svg%3E")`,
            backgroundSize: 'cover',
            backgroundPosition: 'left bottom',
            opacity: 1
          }} />
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <nav style={{
              padding: '28px 48px',
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontWeight: '600',
                fontSize: '18px',
                color: '#fff'
              }}>
                <img src="data:image/png;base64,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" alt="Exactly AI Solutions" style={{ height: '40px', width: 'auto' }} />
              </div>
              <div style={{ display: 'flex', gap: '32px', fontSize: '15px', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                <a href="#faq1" onClick={(e) => { e.preventDefault(); document.getElementById('faq1')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', letterSpacing: '0.02em', transition: 'color 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#FF6B35'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'}>Who We Are</a>
                <a href="#faq2" onClick={(e) => { e.preventDefault(); document.getElementById('faq2')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', letterSpacing: '0.02em', transition: 'color 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#FF6B35'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'}>What We Do</a>
                <a href="#faq4" onClick={(e) => { e.preventDefault(); document.getElementById('faq4')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', letterSpacing: '0.02em', transition: 'color 0.2s ease', cursor: 'pointer' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#FF6B35'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)'}>How It Works</a>
              </div>
            </nav>

            <div style={{ padding: chatActive ? '80px 48px 100px' : '150px 48px 100px', textAlign: 'center', transition: 'padding 0.3s ease' }}>
              <div style={{ maxWidth: chatActive ? '50%' : '820px', margin: '0 auto', minWidth: chatActive ? '560px' : 'auto', transition: 'max-width 0.3s ease' }}>
                {!chatActive && (
                  <>
                    <h1 style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '46px',
                      fontWeight: '500',
                      letterSpacing: '-0.01em',
                      lineHeight: '1.15',
                      marginBottom: '32px',
                      color: '#fff'
                    }}>
                      Grow your business with AI<br />without having to do much at all
                    </h1>

                    <p style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '22px',
                      color: '#FFFFFF',
                      marginBottom: '64px',
                      lineHeight: '1.5',
                      fontWeight: '400',
                      letterSpacing: '-0.01em',
                      opacity: 0.85
                    }}>
                      Our done-for-you service does the work<br />Our outcomes-based pricing eliminates the risk
                    </p>
                  </>
                )}

                {/* H3 + Chatbot + Pills Lockup */}
                <div style={{ maxWidth: chatActive ? '100%' : '740px', margin: '0 auto', marginTop: chatActive ? '0' : '90px' }}>
                  {!chatActive && (
                    <p style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '20px',
                      color: '#FFFFFF',
                      marginBottom: '20px',
                      lineHeight: '1.5',
                      fontWeight: '600',
                      letterSpacing: '-0.01em',
                      textAlign: 'center'
                    }}>
                      Experience our AI in realtime. Get an Instant Report now. No signup.
                    </p>
                  )}

                  {chatActive ? (
                    <InlineChat
                      initialMessage={initialChatMessage}
                      onClose={closeChat}
                      apiUrl={API_URL}
                      tenantId={TENANT_ID}
                      sessionId={chatSessionId}
                      messages={chatMessages}
                      onMessagesChange={setChatMessages}
                    />
                  ) : (
                    <>
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '20px',
                        padding: '10px',
                        boxShadow: '0 4px 32px rgba(0,0,0,0.3), 0 0 80px rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        marginBottom: '24px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
                          <div style={{ flex: 1, position: 'relative' }}>
                            <input
                              ref={heroInputRef}
                              type="text"
                              onFocus={() => setInputFocused(true)}
                              onBlur={(e) => !e.target.value && setInputFocused(false)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAskSubmit()}
                              style={{
                                width: '100%',
                                border: 'none',
                                outline: 'none',
                                padding: '20px 24px',
                                fontSize: '17px',
                                background: 'transparent',
                                color: '#333',
                                fontFamily: 'inherit'
                              }}
                            />
                            {!inputFocused && (
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '24px',
                                transform: 'translateY(-50%)',
                                fontSize: '17px',
                                color: '#666',
                                pointerEvents: 'none',
                                transition: 'opacity 0.5s ease',
                                opacity: placeholderFade ? 1 : 0,
                                fontFamily: 'inherit'
                              }}>
                                {placeholderMessages[placeholderIndex]}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={handleAskSubmit}
                            onMouseEnter={() => setHeroButtonHovered(true)}
                            onMouseLeave={() => setHeroButtonHovered(false)}
                            onMouseDown={() => setHeroButtonActive(true)}
                            onMouseUp={() => setHeroButtonActive(false)}
                            style={{
                            background: '#FF6B35',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '14px',
                            padding: '18px 32px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: heroButtonHovered
                              ? '0 8px 32px rgba(255, 107, 53, 0.6)'
                              : '0 6px 24px rgba(255, 107, 53, 0.4)',
                            fontFamily: "'Outfit', sans-serif",
                            transition: 'all 0.15s ease-out',
                            transform: heroButtonActive
                              ? 'scale(0.98)'
                              : heroButtonHovered
                                ? 'scale(1.02)'
                                : 'scale(1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            ASK
                            <span style={{
                              display: 'inline-block',
                              transition: 'transform 0.15s ease-out',
                              transform: heroButtonHovered ? 'translate(3px, -3px) rotate(-35deg)' : 'rotate(-35deg)',
                              fontSize: '17px'
                            }}>→</span>
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                        {[
                          { label: 'Check Homepage CRO', message: "I'd like a CRO Assessment" },
                          { label: 'Order a SWOT Report', message: "Please provide me with a SWOT report" },
                          { label: 'SHOW AI Opportunities', message: "What AI Opportunities are available for my company?" },
                        ].map((item, idx) => (
                          <button
                            key={`top-${idx}`}
                            onClick={() => startChat(item.message)}
                            onMouseEnter={() => setPillHovered(`pill-top-${idx}`, true)}
                            onMouseLeave={() => setPillHovered(`pill-top-${idx}`, false)}
                            onMouseDown={() => setPillActive(`pill-top-${idx}`, true)}
                            onMouseUp={() => setPillActive(`pill-top-${idx}`, false)}
                            style={{
                            background: hoveredPills[`pill-top-${idx}`]
                              ? 'rgba(255, 255, 255, 0.3)'
                              : 'rgba(255, 255, 255, 0.2)',
                            border: hoveredPills[`pill-top-${idx}`]
                              ? '1px solid #FFFFFF'
                              : '1px solid transparent',
                            borderRadius: '18px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: '500',
                            transition: 'all 0.2s ease-out',
                            transform: activePills[`pill-top-${idx}`]
                              ? 'scale(0.97)'
                              : 'scale(1)'
                          }}>
                            {item.label}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        {[
                          { label: 'Lower Overhead with AI', message: "How can I lower my overhead using AI solutions?" },
                          { label: 'Learn about Exactly', message: "Tell me more about Exactly" },
                        ].map((item, idx) => (
                          <button
                            key={`bottom-${idx}`}
                            onClick={() => startChat(item.message)}
                            onMouseEnter={() => setPillHovered(`pill-bottom-${idx}`, true)}
                            onMouseLeave={() => setPillHovered(`pill-bottom-${idx}`, false)}
                            onMouseDown={() => setPillActive(`pill-bottom-${idx}`, true)}
                            onMouseUp={() => setPillActive(`pill-bottom-${idx}`, false)}
                            style={{
                            background: hoveredPills[`pill-bottom-${idx}`]
                              ? 'rgba(255, 255, 255, 0.3)'
                              : 'rgba(255, 255, 255, 0.2)',
                            border: hoveredPills[`pill-bottom-${idx}`]
                              ? '1px solid #FFFFFF'
                              : '1px solid transparent',
                            borderRadius: '18px',
                            padding: '8px 16px',
                            fontSize: '13px',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            fontFamily: "'Outfit', sans-serif",
                            fontWeight: '500',
                            transition: 'all 0.2s ease-out',
                            transform: activePills[`pill-bottom-${idx}`]
                              ? 'scale(0.97)'
                              : 'scale(1)'
                          }}>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============ FAQ SECTION ============ */}
        <section style={{
          maxWidth: '740px',
          margin: '0 auto',
          padding: '0 24px 0 24px'
        }}>
          {faqs.map((faq, index) => {
            // Define background styles for each section
            let sectionStyle: React.CSSProperties = {
              paddingBottom: index === 8 ? '0px' : '80px', // No bottom padding on last section
              marginBottom: '0',
              borderBottom: 'none',
              position: 'relative'
            };

            // 3-color rotation: White, Grain, Blue-purple gradient
            if (index === 0) {
              // Section 1 keeps gradient transition from hero
              sectionStyle = {
                ...sectionStyle,
                margin: '0 -100vw 0 -100vw',
                padding: '100px 100vw 90px 100vw',
                background: `
                  linear-gradient(180deg, #001a30 0%, rgba(250,245,240,0) 300px),
                  #FAF5F0
                `,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")'
              };
            } else {
              switch((index - 1) % 3) {
                case 0: // White
                  sectionStyle = {
                    ...sectionStyle,
                    margin: '0 -100vw 0 -100vw',
                    padding: '90px 100vw',
                    background: '#FFFFFF'
                  };
                  break;
                case 1: // Blue-purple gradient (swapped with grain)
                  sectionStyle = {
                    ...sectionStyle,
                    margin: '0 -100vw 0 -100vw',
                    padding: '90px 100vw',
                    background: 'linear-gradient(135deg, #F0F9FF 0%, #F5F3FF 100%)'
                  };
                  break;
                case 2: // Grain texture (swapped with blue)
                  sectionStyle = {
                    ...sectionStyle,
                    margin: '0 -100vw 0 -100vw',
                    padding: '90px 100vw',
                    background: '#FAF5F0',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")'
                  };
                  break;
              }
            }

            return (
              <article id={faq.id} key={faq.id} style={sectionStyle}>
                <h2 style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '36px',
                  fontWeight: '700',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.15',
                  marginBottom: '24px',
                  color: '#1a1a1a'
                }} dangerouslySetInnerHTML={{ __html: faq.question }}>
                </h2>
                
                <p style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '22px',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginBottom: '28px',
                  lineHeight: '1.5'
                }} dangerouslySetInnerHTML={{ __html: faq.leadIn }}>
                </p>
                
                {faq.content.map((para, i) => (
                  <p key={i} style={{
                    fontSize: '18px',
                    lineHeight: '1.7',
                    color: '#1a1a1a',
                    marginBottom: '20px',
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: '400'
                  }} dangerouslySetInnerHTML={{ 
                    __html: para.replace(/<strong>/g, '<strong style="font-weight: 700; color: #333;">').replace(/<\/strong>/g, '</strong>')
                  }}>
                  </p>
                ))}
                
                {faq.bullets && (
                  <ul style={{
                    marginBottom: '20px',
                    paddingLeft: '24px'
                  }}>
                    {faq.bullets.map((bullet, i) => (
                      <li key={i} style={{
                        fontSize: '18px',
                        lineHeight: '1.7',
                        color: '#1a1a1a',
                        marginBottom: '12px',
                        fontFamily: "'Outfit', sans-serif",
                        fontWeight: '400'
                      }} dangerouslySetInnerHTML={{
                        __html: bullet.replace(/<strong>/g, '<strong style="font-weight: 700; color: #333;">').replace(/<\/strong>/g, '</strong>')
                      }}>
                      </li>
                    ))}
                  </ul>
                )}
                
                {faq.contentAfter && (
                  <p style={{
                    fontSize: '18px',
                    lineHeight: '1.7',
                    color: '#1a1a1a',
                    marginBottom: '20px',
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: '400'
                  }} dangerouslySetInnerHTML={{
                    __html: faq.contentAfter.replace(/<strong>/g, '<strong style="font-weight: 700; color: #333;">').replace(/<\/strong>/g, '</strong>')
                  }}>
                  </p>
                )}
                
                {/* Section 8: Smaller chatbot instead of CTA */}
                {index === 7 ? (
                  <div style={{ marginTop: '56px' }}>
                    <div style={{
                      background: '#FAF5F0',
                      borderRadius: '16px',
                      padding: '16px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                      border: '2px solid #E5E5E5',
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'center'
                    }}>
                      <input
                        type="text"
                        placeholder="Ask us anything..."
                        style={{
                          flex: 1,
                          border: 'none',
                          outline: 'none',
                          fontSize: '15px',
                          background: 'transparent',
                          color: '#1a1a1a',
                          fontFamily: "'Outfit', sans-serif"
                        }}
                      />
                      <button style={{
                        background: '#FF6B35',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '12px 20px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(255, 107, 53, 0.3)',
                        fontFamily: "'Outfit', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        ASK
                        <span style={{ fontSize: '14px', transform: 'rotate(-35deg)' }}>→</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <CTAPill id={faq.id} ctaText={faq.cta} />
                )}
              </article>
            );
          })}
        </section>

        {/* ============ FOOTER ============ */}
        <footer style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '80px 24px 40px 24px'
        }}>
          {/* Hero gradient background layers - matched to hero with adjusted positioning */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(ellipse 120% 150% at 100% 50%, rgba(0, 170, 230, 0.5) 0%, transparent 50%),
              radial-gradient(ellipse 140% 180% at 95% 60%, rgba(0, 130, 210, 0.7) 0%, transparent 55%),
              radial-gradient(ellipse 160% 200% at 90% 50%, rgba(40, 80, 190, 0.65) 0%, transparent 60%),
              radial-gradient(ellipse 180% 220% at 85% 55%, rgba(80, 55, 165, 0.55) 0%, transparent 65%),
              radial-gradient(ellipse 200% 240% at 80% 60%, rgba(110, 45, 145, 0.45) 0%, transparent 70%),
              radial-gradient(ellipse 100% 120% at 20% 30%, rgba(60, 100, 200, 0.25) 0%, transparent 50%),
              radial-gradient(ellipse 80% 100% at 50% 60%, rgba(100, 70, 180, 0.2) 0%, transparent 45%),
              radial-gradient(ellipse 110% 130% at 70% 40%, rgba(30, 120, 200, 0.18) 0%, transparent 48%),
              linear-gradient(180deg, #001830 0%, #001225 50%, #001a30 100%)
            `
          }} />
          
          {/* Growth pattern overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='1200' height='800' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='lines' width='1200' height='800' patternUnits='userSpaceOnUse'%3E%3Cg stroke='%23FF8F5C' stroke-width='1.5' opacity='0.08' fill='none'%3E%3Cpath d='M 0 800 Q 200 600 400 0'/%3E%3Cpath d='M 0 800 Q 250 550 500 0'/%3E%3Cpath d='M 0 800 Q 300 500 600 0'/%3E%3Cpath d='M 0 800 Q 350 450 700 0'/%3E%3Cpath d='M 0 800 Q 400 400 800 0'/%3E%3Cpath d='M 0 800 Q 450 350 900 0'/%3E%3Cpath d='M 0 800 Q 500 300 1000 0'/%3E%3Cpath d='M 0 800 Q 550 250 1100 0'/%3E%3Cpath d='M 0 800 Q 600 200 1200 0'/%3E%3Cpath d='M 0 800 Q 700 300 1200 100'/%3E%3Cpath d='M 0 800 Q 800 400 1200 200'/%3E%3Cpath d='M 0 800 Q 900 500 1200 300'/%3E%3Cpath d='M 0 800 Q 1000 600 1200 400'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23lines)'/%3E%3C/svg%3E")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 1
          }} />
          
          <div style={{
            position: 'relative',
            zIndex: 1,
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 48px'
          }}>
            {/* Main footer content - 3 columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 2.5fr',
              gap: '100px',
              marginBottom: '60px'
            }}>
              {/* Left: Logo + Tagline + Social */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <img src="data:image/png;base64,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" alt="Exactly AI Solutions" style={{ height: '55px', width: 'auto' }} />
                </div>
                
                <p style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: 'rgba(255,255,255,0.85)',
                  marginBottom: '32px'
                }}>
                  AI services that work the way you need them to, managed end-to-end with guaranteed results.
                </p>
                
                <div style={{ display: 'flex', gap: '24px', marginTop: '12px', alignItems: 'center' }}>
                  <a href="https://www.linkedin.com/company/exactly-ai-solutions/?viewAsMember=true" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '28px', textDecoration: 'none', transition: 'color 0.2s', fontWeight: '600' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#FF6B35'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'}>in</a>
                  <a href="mailto:hello@exactlyai.solutions" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '36px', textDecoration: 'none', transition: 'color 0.2s', lineHeight: '1' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#FF6B35'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'}>✉</a>
                  <a href="tel:+12128138134" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg) svg.style.stroke = '#FF6B35'; }} onMouseLeave={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg) svg.style.stroke = 'rgba(255,255,255,0.7)'; }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ stroke: 'rgba(255,255,255,0.7)', transition: 'stroke 0.2s' }}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>
              
              {/* Middle: Navigation */}
              <div style={{ marginTop: '45px' }}>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <a href="#faq1" onClick={(e) => { e.preventDefault(); document.getElementById('faq1')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    cursor: 'pointer'
                  }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#FF6B35'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = '#FFFFFF'}>Who We Are</a>
                  <a href="#faq2" onClick={(e) => { e.preventDefault(); document.getElementById('faq2')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    cursor: 'pointer'
                  }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#FF6B35'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = '#FFFFFF'}>What We Do</a>
                  <a href="#faq4" onClick={(e) => { e.preventDefault(); document.getElementById('faq4')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    cursor: 'pointer'
                  }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#FF6B35'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = '#FFFFFF'}>How It Works</a>
                  <a href="#faq7" onClick={(e) => { e.preventDefault(); document.getElementById('faq7')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    cursor: 'pointer'
                  }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#FF6B35'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = '#FFFFFF'}>Get A Chatbot</a>
                </nav>
              </div>
              
              {/* Right: CTA Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <button
                  onClick={() => startChat("I'd like to learn more about Exactly")}
                  onMouseEnter={(e) => {
                    (e.target as HTMLButtonElement).style.transform = 'scale(1.02)';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(255, 107, 53, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLButtonElement).style.transform = 'scale(1)';
                    (e.target as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(255, 107, 53, 0.4)';
                  }}
                  style={{
                    background: '#FF6B35',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '50px',
                    padding: '18px 36px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: "'Outfit', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease-out',
                    transform: 'scale(1)',
                    boxShadow: '0 6px 24px rgba(255, 107, 53, 0.4)'
                  }}>
                  Start a conversation
                  <span style={{ fontSize: '18px' }}>→</span>
                </button>
              </div>
            </div>
            
            {/* Bottom: Copyright + Legal Links */}
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.2)',
              paddingTop: '32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)'
              }}>
                Copyright © 2025 Exactly AI Solutions
              </div>
              
              <div style={{
                display: 'flex',
                gap: '24px',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)'
              }}>
                <a href="/cookie-policy.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#FFFFFF'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}>Cookie Policy</a>
                <span>|</span>
                <a href="/privacy-policy.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#FFFFFF'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}>Privacy Policy</a>
                <span>|</span>
                <a href="/terms-of-service.pdf" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.color = '#FFFFFF'} onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}>Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
