/**
 * Prompt Template Definitions
 *
 * Quality and negative prompt templates for quick selection
 */

export interface PromptTemplate {
  readonly id: string;
  readonly name: string;
  readonly prompt: string;
  readonly description: string;
}

/**
 * Quality templates for positive prompts
 */
export const qualityTemplates: ReadonlyArray<PromptTemplate> = [
  {
    id: 'quality-high',
    name: '高品質',
    prompt: 'masterpiece, best quality, ultra-detailed, 8k, high resolution, sharp focus',
    description: '最高品質の画像生成用テンプレート'
  },
  {
    id: 'quality-standard',
    name: '標準品質',
    prompt: 'high quality, detailed, good lighting',
    description: '標準的な品質設定'
  },
  {
    id: 'quality-simple',
    name: 'シンプル',
    prompt: 'good quality',
    description: 'シンプルな品質設定'
  },
  {
    id: 'quality-anime',
    name: 'アニメ高品質',
    prompt: 'masterpiece, best quality, ultra-detailed, anime style, vibrant colors',
    description: 'アニメスタイル向け高品質設定'
  }
] as const;

/**
 * Negative prompt templates
 */
export const negativeTemplates: ReadonlyArray<PromptTemplate> = [
  {
    id: 'negative-standard',
    name: '標準',
    prompt: 'worst quality, low quality, bad anatomy, bad hands, missing fingers, extra fingers',
    description: '基本的なネガティブプロンプト'
  },
  {
    id: 'negative-detailed',
    name: '詳細',
    prompt: 'worst quality, low quality, bad anatomy, bad hands, missing fingers, extra fingers, extra limbs, malformed limbs, fused fingers, too many fingers, long neck, cross-eyed, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, bad proportions, extra legs, extra arms, disfigured, cropped, watermark, signature, text, jpeg artifacts',
    description: '詳細なネガティブプロンプト（多くの除外項目）'
  },
  {
    id: 'negative-minimal',
    name: 'ミニマル',
    prompt: 'low quality, blurry',
    description: '最小限のネガティブプロンプト'
  },
  {
    id: 'negative-realistic',
    name: 'リアル向け',
    prompt: 'worst quality, low quality, bad anatomy, bad hands, unrealistic, cartoon, anime, painting, drawing, illustration, 3d render',
    description: 'リアル系画像生成用'
  },
  {
    id: 'negative-anime',
    name: 'アニメ向け',
    prompt: 'worst quality, low quality, bad anatomy, bad hands, realistic, photorealistic, 3d, ugly, duplicate, morbid, mutilated',
    description: 'アニメスタイル画像生成用'
  }
] as const;

/**
 * Get template by ID
 */
export const getTemplateById = (
  templates: ReadonlyArray<PromptTemplate>,
  id: string
): PromptTemplate | undefined => {
  return templates.find(template => template.id === id);
};

/**
 * Get default quality template
 */
export const getDefaultQualityTemplate = (): PromptTemplate => {
  const template = qualityTemplates[0];
  if (!template) {
    throw new Error('No quality templates available');
  }
  return template;
};

/**
 * Get default negative template
 */
export const getDefaultNegativeTemplate = (): PromptTemplate => {
  const template = negativeTemplates[0];
  if (!template) {
    throw new Error('No negative templates available');
  }
  return template;
};
