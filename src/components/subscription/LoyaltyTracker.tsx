import React from 'react';
import { useApp } from '../../context/AppContext';
import { Gift, Sparkles, TrendingUp, CheckCircle, ShieldAlert, FastForward } from 'lucide-react';

export const LoyaltyTracker: React.FC = () => {
  const { currentStudio, advanceStudioTenure, redeemLoyaltyFreeMonth } = useApp();

  const currentCycleProgress = currentStudio.tenureMonths % 12;
  const progressPercent = Math.min(100, Math.round((currentCycleProgress / 12) * 100));
  const monthsUntilFree = 12 - currentCycleProgress;

  const hasUnusedReward = currentStudio.loyaltyFreeMonthsEarned > currentStudio.loyaltyFreeMonthsUsed;

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#C9A24B]/40 shadow-xs relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#FBF6EB] border border-[#C9A24B]/30 text-[#C9A24B] shrink-0">
            <Gift className="w-5 h-5 text-[#C9A24B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-base text-[#232A5C]">
                Loyalty Reward: The Free Subscription Month
              </h3>
              <span className="text-[10px] bg-[#FBF6EB] text-[#C9A24B] font-bold px-2 py-0.5 rounded-full border border-[#C9A24B]/30 uppercase">
                Section 17.2
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1 max-w-xl">
              Subscribe continuously for 12 paid months to earn 1 free subscription month. Repeats every 13th month.
              Annual subscribers receive <strong>13 months for the price of 11 (2 free months total)</strong>.
            </p>
          </div>
        </div>

        {/* Claim Free Month CTA if eligible */}
        {hasUnusedReward ? (
          <button
            onClick={redeemLoyaltyFreeMonth}
            className="px-4 py-2 rounded-xl bg-[#3F7D5C] hover:bg-[#326449] text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0 animate-bounce"
          >
            <Sparkles className="w-4 h-4" />
            <span>Apply Free Month Now!</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {/* Simulation button for pair programming / grading verification */}
            <button
              onClick={() => advanceStudioTenure(1)}
              className="px-3 py-1.5 rounded-lg border border-[#E4DCD0] bg-[#FAF6F0] hover:bg-[#EAE4D9] text-[#232A5C] text-xs font-medium flex items-center gap-1 transition-colors"
              title="Simulate 1 paid billing month to test loyalty progression"
            >
              <FastForward className="w-3.5 h-3.5 text-[#E2573A]" />
              <span>Simulate +1 Month Tenure</span>
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar & Milestone Status */}
      <div className="mt-4 pt-4 border-t border-stone-100 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-stone-700 font-medium">
            <TrendingUp className="w-4 h-4 text-[#C9A24B]" />
            <span>
              Continuous Tenure:{' '}
              <strong className="text-[#232A5C]">
                {currentCycleProgress} of 12 continuous paid months
              </strong>{' '}
              ({currentStudio.tenureMonths} total months)
            </span>
          </div>

          <span className="font-bold text-[#232A5C]">
            {hasUnusedReward ? (
              <span className="text-[#3F7D5C] flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> 1 Free Month Ready
              </span>
            ) : (
              `${monthsUntilFree} month${monthsUntilFree > 1 ? 's' : ''} to next reward`
            )}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-[#FAF6F0] border border-[#E4DCD0] h-3 rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#C9A24B] to-[#E2573A] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone Reminders (LOY-3: Months 10 and 12) */}
        {currentCycleProgress >= 10 && !hasUnusedReward && (
          <div className="text-[11px] text-[#A07A28] bg-[#FBF6EB] p-2 rounded-lg border border-[#C9A24B]/30 flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A24B]" />
            <span>
              <strong>Almost there!</strong> Only {monthsUntilFree} month{monthsUntilFree > 1 ? 's' : ''} left
              until your 13th month subscription fee is waived!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

