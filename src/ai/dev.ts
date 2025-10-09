
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-readme.ts';
import '@/ai/flows/translate-message-flow.ts';
import '@/ai/flows/detect-language-flow.ts';
import '@/ai/flows/send-push-notification-flow.ts';
