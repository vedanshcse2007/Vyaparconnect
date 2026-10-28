import React, { useState } from 'react';
import { MessageSquare, CheckCircle2, Clock, Send, Phone, User } from 'lucide-react';
import { CustomerEnquiry, Shop } from '../../types/index.ts';
import { formatTimeAgo } from '../../lib/timeAgo.ts';

interface EnquiriesManagerProps {
  currentShop: Shop;
  enquiries: CustomerEnquiry[];
  onReplyEnquiry: (id: string, reply: string) => Promise<void>;
}

export const EnquiriesManager: React.FC<EnquiriesManagerProps> = ({
  currentShop,
  enquiries,
  onReplyEnquiry,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  const shopEnquiries = enquiries.filter((e) => e.shopId === currentShop.id);
  const filtered = shopEnquiries.filter((e) => {
    if (filter === 'pending') return e.status === 'pending';
    if (filter === 'replied') return e.status === 'replied';
    return true;
  });

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await onReplyEnquiry(id, replyText.trim());
      setReplyText('');
      setActiveReplyId(null);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Customer Inquiries & Product Requests
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Questions asked by shoppers discovering your store on the public website.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({shopEnquiries.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({shopEnquiries.filter((e) => e.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('replied')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              filter === 'replied' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Answered
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
            No inquiries in this category.
          </div>
        ) : (
          filtered.map((enq) => {
            const isPending = enq.status === 'pending';
            return (
              <div
                key={enq.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{enq.customerName}</span>
                      {enq.customerPhone && (
                        <span className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Phone className="w-3 h-3" />
                          {enq.customerPhone}
                        </span>
                      )}
                    </div>
                    {enq.productName && (
                      <div className="text-xs text-emerald-800 font-semibold">
                        Item: {enq.productName}
                      </div>
                    )}
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      isPending
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {isPending ? 'Pending Response' : 'Answered'}
                  </span>
                </div>

                {/* Message Body */}
                <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100">
                  "{enq.message}"
                </div>

                {/* Existing Reply */}
                {enq.reply && (
                  <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs text-emerald-950 space-y-1">
                    <div className="font-bold text-[11px] text-emerald-800">Your Shop Reply:</div>
                    <p>{enq.reply}</p>
                    {enq.repliedAt && (
                      <div className="text-[10px] text-emerald-700 font-mono pt-1">
                        Sent {formatTimeAgo(enq.repliedAt)}
                      </div>
                    )}
                  </div>
                )}

                {/* Reply Form */}
                {isPending && (
                  <div className="pt-2 border-t border-slate-100">
                    {activeReplyId === enq.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply to customer..."
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setActiveReplyId(null);
                              setReplyText('');
                            }}
                            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSendReply(enq.id)}
                            disabled={sending || !replyText.trim()}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{sending ? 'Sending...' : 'Send Reply'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveReplyId(enq.id);
                          setReplyText(
                            `Hello ${enq.customerName}, yes this is available in stock. You can visit between 9 AM - 9 PM.`
                          );
                        }}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Reply to Customer</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
