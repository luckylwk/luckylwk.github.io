---
title: 'DeepSeek D-Spark'
description: 'DeepSeek D-Spark'
pubDate: 'July 15 2026'
tags: ['llm']
---

# DeepSeek D-Spark

Mixes the drafting advances of DFlash (parallel) with EAGLE-3/MTP (sequential).

TODO: Parallel outputs ? logits?

Sequential is a lightweight Markov model.

The 'optimal' number of draft tokens depends on the domain. There is high domain variance as code is relatively 'predictable' (low-entropy) and therefore you can draft further ahead, but chat is more open ended (high-entropy).

Novelty: confidence head outputs how likely a token is to be accepted/rejected. This means we can draft N tokens and verify the first M (M<=N). They also make this process hardware aware, so based on utilisation it can ensure it is optimised to do more or less.

## Links:

- [How Speculative Decoding Makes LLMs Faster Without Retraining (and What DSpark Adds)](https://deepseek.ai/blog/deepseek-dspark-speculative-decoding)
- [DSpark: Confidence-Scheduled Speculative Decoding with Semi-Autoregressive Generation](https://arxiv.org/abs/2607.05147)
- [DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence - Huggingface](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-DSpark)
- [DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence - Paper](https://arxiv.org/abs/2606.19348)