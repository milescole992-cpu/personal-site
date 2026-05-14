alter table public.resources
add column if not exists audience text not null default '',
add column if not exists use_cases text not null default '';

delete from public.resources
where title in (
  '示例 AI 资源 01',
  'ChatGPT 官方入口与基础用法',
  'Claude 长文写作与资料分析',
  'Perplexity AI 搜索研究助手',
  'Google Gemini 多模态助手',
  'NotebookLM 资料型知识库',
  'Canva Magic Studio 设计工具箱',
  'Midjourney 视觉灵感与图片生成',
  'Runway AI 视频生成与编辑',
  'ElevenLabs AI 语音与配音',
  'Hugging Face 模型与开源社区'
);

insert into public.resources (
  title,
  description,
  category,
  tags,
  source_url,
  download_url,
  audience,
  use_cases,
  requires_login,
  published_at,
  rating
) values
(
  'ChatGPT 官方入口与基础用法',
  '通用型 AI 助手入口，适合用来写作、总结、改写、头脑风暴、学习解释和轻量办公。建议作为新手第一个熟悉的 AI 工具。',
  '通用助手',
  array['AI助手','写作','办公','新手入门'],
  'https://openai.com/chatgpt/',
  'https://chatgpt.com/',
  'AI 新手、内容创作者、自由职业者、需要日常提效的普通人',
  '文章大纲、短视频脚本、资料总结、邮件改写、学习问答、方案草稿',
  true,
  now() - interval '1 day',
  5
),
(
  'Claude 长文写作与资料分析',
  '偏长文本理解和结构化表达的 AI 助手，适合处理文章、文档、课程资料、产品文案和复杂思路梳理。',
  '通用助手',
  array['长文','写作','分析','海外工具'],
  'https://www.anthropic.com/claude',
  'https://claude.ai/',
  '写作者、知识博主、课程制作者、需要处理长资料的人',
  '长文润色、文档摘要、文章结构优化、课程脚本、商业文案初稿',
  true,
  now() - interval '2 days',
  5
),
(
  'Perplexity AI 搜索研究助手',
  '带来源引用的 AI 搜索工具，适合快速了解一个新主题、做资料检索、对比观点和收集参考链接。',
  'AI搜索',
  array['搜索','研究','资料整理','来源引用'],
  'https://www.perplexity.ai/',
  'https://www.perplexity.ai/',
  '内容创作者、研究型博主、产品经理、选题策划者',
  '选题调研、竞品资料搜索、热点背景梳理、文章参考来源收集',
  true,
  now() - interval '3 days',
  5
),
(
  'Google Gemini 多模态助手',
  'Google 的 AI 助手入口，适合结合 Google 生态做信息处理、图片理解、学习问答和日常任务规划。',
  '通用助手',
  array['Google','多模态','学习','办公'],
  'https://gemini.google/about/',
  'https://gemini.google.com/',
  'Google 生态用户、学生、办公人群、需要图文理解的创作者',
  '图片理解、学习问答、资料解释、日程想法整理、Google 生态辅助',
  true,
  now() - interval '4 days',
  4
),
(
  'NotebookLM 资料型知识库',
  '面向资料阅读和知识整理的 AI 笔记工具，适合把文档、网页、视频等材料变成可提问的专题知识库。',
  '知识库',
  array['知识库','资料整理','学习','Google'],
  'https://notebooklm.google/',
  'https://notebooklm.google/',
  '学生、研究者、课程学习者、做专题内容的创作者',
  '课程资料整理、论文/报告阅读、专题知识库、播客/视频资料提炼',
  true,
  now() - interval '5 days',
  5
),
(
  'Canva Magic Studio 设计工具箱',
  '适合非设计师快速完成封面、海报、社媒图、PPT 和品牌视觉素材的 AI 设计工具集合。',
  '设计创作',
  array['设计','海报','社媒','PPT'],
  'https://www.canva.com/magic/',
  'https://www.canva.com/magic/',
  '自媒体人、小团队、课程博主、电商和副业项目操盘者',
  '小红书/公众号封面、短视频封面、课程海报、PPT 初稿、社媒素材',
  true,
  now() - interval '6 days',
  4
),
(
  'Midjourney 视觉灵感与图片生成',
  '高质量 AI 图片生成工具，适合做视觉探索、概念图、风格参考、海报灵感和创意素材测试。',
  '图片生成',
  array['图片生成','视觉','灵感','海外工具'],
  'https://www.midjourney.com/',
  'https://www.midjourney.com/',
  '设计师、视觉创作者、品牌策划、内容创作者',
  '视觉风格探索、封面概念图、品牌 moodboard、广告创意草图',
  true,
  now() - interval '7 days',
  4
),
(
  'Runway AI 视频生成与编辑',
  '面向视频生成、镜头实验和创意剪辑的 AI 工具，适合短视频、广告分镜和视觉实验。',
  '视频创作',
  array['视频','生成式AI','剪辑','创作者'],
  'https://runwayml.com/',
  'https://runwayml.com/',
  '短视频创作者、广告策划、视觉团队、独立创作者',
  '短片镜头测试、广告分镜、视频背景生成、创意转场和动态素材',
  true,
  now() - interval '8 days',
  4
),
(
  'ElevenLabs AI 语音与配音',
  'AI 语音生成和配音工具，适合做旁白、播客、课程音频、多语言配音和声音内容实验。',
  '音频创作',
  array['语音','配音','播客','多语言'],
  'https://elevenlabs.io/',
  'https://elevenlabs.io/',
  '视频创作者、播客作者、课程制作者、出海内容团队',
  '短视频旁白、课程配音、播客片段、多语言内容、本地化声音素材',
  true,
  now() - interval '9 days',
  4
),
(
  'Hugging Face 模型与开源社区',
  'AI 模型、数据集和开源应用社区，适合寻找模型 Demo、学习开源项目、验证技术方案和追踪 AI 生态。',
  '开发资源',
  array['开源','模型','开发者','社区'],
  'https://huggingface.co/',
  'https://huggingface.co/',
  '开发者、AI 工具玩家、技术型创作者、想了解模型生态的人',
  '模型 Demo 体验、开源项目学习、技术选型、AI 应用原型验证',
  true,
  now() - interval '10 days',
  5
);
