-- When Gemini cannot propose any adaptation for a tier (insufficient budget, structural
-- infeasibility), we still surface the tier with a plain-English explanation instead of hiding
-- it. Persist that explanation on the plan row.
ALTER TABLE cost_estimation_plans
  ADD COLUMN IF NOT EXISTS unavailable_reason TEXT;
