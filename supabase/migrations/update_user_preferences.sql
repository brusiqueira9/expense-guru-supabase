-- Adicionar novos campos para preferências de notificação
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS daily_summary BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS expense_reminders BOOLEAN DEFAULT TRUE; 