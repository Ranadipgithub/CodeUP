import axiosClient from '@/utils/axiosClient';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  Copy,
  Check
} from 'lucide-react';

// 1. Import Markdown and Syntax Highlighter
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- HELPER COMPONENT: Copy Button for Code Blocks ---
const CodeBlock = ({ language, children }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-white/10 bg-[#0A0A0A]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1A1A1A] border-b border-white/5">
        <span className="text-xs text-gray-400 font-mono lowercase">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-[#4ADE80] transition-colors"
        >
          {copied ? <Check size={14} className="text-[#4ADE80]"/> : <Copy size={14} />}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={vscDarkPlus}
        customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '0.8rem', lineHeight: '1.5' }}
        wrapLines={true}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

const ChatAI = ({ problem }) => {
  const [messages, setMessages] = useState([
    { 
      role: 'model', 
      parts: [{ text: "Hello! I'm your CodeCraft AI assistant. I can help you with hints, debugging, or explaining the approach for **" + (problem?.title || "this problem") + "**. How can I help?" }] 
    }
  ]);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const messageEndRef = useRef(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSubmitting]);

  const onSubmit = async (data) => {
    const userMessage = data.message;
    if (!userMessage.trim()) return;

    setMessages(prev => [...prev, { role: 'user', parts: [{ text: userMessage }] }]);
    reset();

    try {
      const response = await axiosClient.post('/ai/chat', {
        messages: [...messages, { role: 'user', parts: [{ text: userMessage }] }],
        title: problem?.title,
        description: problem?.description,
        testCases: problem?.visibleTestCases,
        startCode: problem?.startCode,
      });

      setMessages(prev => [...prev, { role: 'model', parts: [{ text: response.data.message }] }]);
    } catch (err) {
      console.log(err);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Sorry, I encountered an error processing your request." }] }]);
    }
  };

  return (
    // Outer container: h-full is crucial here to fill the parent section
    <div className="flex flex-col h-full bg-[#121212] text-gray-200 font-sans border-l border-white/5">
      
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-6 py-4 border-b border-white/10 bg-[#121212] z-10 shadow-sm">
        <div className="p-1.5 bg-[#4ADE80]/10 rounded-lg">
             <Sparkles size={16} className="text-[#4ADE80]" />
        </div>
        <div>
            <h3 className="text-sm font-bold text-white tracking-wide">AI Assistant</h3>
            <p className="text-[10px] text-gray-500">Powered by Gemini</p>
        </div>
      </div>

      {/* Chat Area - flex-1 and min-h-0 are key for scrolling within flex items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth custom-scrollbar min-h-0">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div 
              key={index} 
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`
                shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border mt-1
                ${isUser 
                  ? 'bg-[#2A2A2A] border-white/10 text-gray-300' 
                  : 'bg-[#4ADE80]/10 border-[#4ADE80]/20 text-[#4ADE80]'
                }
              `}>
                {isUser ? <User size={16} /> : <Bot size={16} />}
              </div>

              {/* Bubble */}
              <div className={`
                max-w-[90%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-md overflow-hidden
                ${isUser 
                  ? 'bg-[#262626] text-gray-100 rounded-tr-sm border border-white/5' 
                  : 'bg-[#1A1A1A] border border-white/10 text-gray-300 rounded-tl-sm'
                }
              `}>
                {/* 2. RENDER MARKDOWN HERE */}
                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Custom rendering for code blocks
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <CodeBlock language={match[1]}>
                            {String(children).replace(/\n$/, '')}
                          </CodeBlock>
                        ) : (
                          <code className="bg-[#4ADE80]/10 text-[#4ADE80] px-1.5 py-0.5 rounded text-xs font-mono border border-[#4ADE80]/20" {...props}>
                            {children}
                          </code>
                        );
                      },
                      // Style other markdown elements
                      h3: ({node, ...props}) => <h3 className="text-base font-bold text-white mt-4 mb-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 space-y-1 mb-4 text-gray-300" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 space-y-1 mb-4 text-gray-300" {...props} />,
                      p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                      strong: ({node, ...props}) => <strong className="text-white font-semibold" {...props} />,
                      a: ({node, ...props}) => <a className="text-[#4ADE80] hover:underline" {...props} />,
                    }}
                  >
                    {msg.parts[0].text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          );
        })}

        {isSubmitting && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-lg bg-[#4ADE80]/10 border border-[#4ADE80]/20 text-[#4ADE80] flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-[#1A1A1A] border border-white/10 text-gray-400 rounded-2xl rounded-tl-sm px-4 py-3 text-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-[#4ADE80]" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-4 bg-[#121212] border-t border-white/10">
        <form onSubmit={handleSubmit(onSubmit)} className="relative flex items-center">
          <input
            {...register("message", { required: true })}
            type="text"
            placeholder="Ask about code, approach, or errors..."
            autoComplete="off"
            className="w-full bg-[#1A1A1A] text-sm text-white placeholder-gray-500 border border-white/10 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-[#4ADE80] focus:ring-1 focus:ring-[#4ADE80] transition-all"
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`absolute right-2 p-2 rounded-lg transition-all duration-200 ${isSubmitting ? 'bg-transparent text-gray-600 cursor-not-allowed' : 'bg-[#4ADE80] hover:bg-[#3ec46d] text-black shadow-lg shadow-green-500/20'}`}
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} className="ml-0.5" />}
          </button>
        </form>
        <div className="text-center mt-2">
           <p className="text-[10px] text-gray-600">AI can make mistakes. Verify important code.</p>
        </div>
      </div>
    </div>
  )
}

export default ChatAI;