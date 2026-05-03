# AI-Toolkit UI 参数说明

## 说明范围
本文档基于当前项目的 `Simple UI` 新建训练任务页面整理，主要对应 [SimpleJob.tsx](/mnt/c/Users/23096/PycharmProjects/ai-toolkit/ui/src/app/jobs/new/SimpleJob.tsx)、[jobConfig.ts](/mnt/c/Users/23096/PycharmProjects/ai-toolkit/ui/src/app/jobs/new/jobConfig.ts) 和 [options.ts](/mnt/c/Users/23096/PycharmProjects/ai-toolkit/ui/src/app/jobs/new/options.ts)。不同模型架构显示的字段不完全相同，文中已标注“仅特定模型显示”的参数。

## 1. Job

| 参数 | 作用 |
| --- | --- |
| `Training Name` | 训练任务名，同时影响输出目录和保存文件名。用于断点续训和版本区分。 |
| `GPU ID` | 指定使用哪张 GPU 训练。多卡机器上必须选对。 |
| `Trigger Word` | 训练触发词。会注入到 caption 或采样 prompt 中，方便推理时稳定调用 LoRA 能力。部分模型不显示。 |

## 2. Model

| 参数 | 作用 |
| --- | --- |
| `Model Architecture` | 选择训练模型架构，如 `flux`、`flux_kontext`、`wan` 等。会决定后续可见字段和默认值。 |
| `Name or Path` | 基础模型的 Hugging Face 名称或本地路径。 |
| `Training Adapter Path` | 仅部分模型显示。指定训练时需要额外加载的适配器 LoRA。 |
| `Low VRAM` | 低显存模式，降低显存占用但通常更慢。 |
| `Match Target Res` | 仅特定模型显示。让输入控制图分辨率尽量匹配目标图。 |
| `Layer Offloading` | 将部分模块在 CPU/GPU 间卸载以节省显存。 |
| `Transformer Offload %` | 设定 Transformer 的卸载比例。 |
| `Text Encoder Offload %` | 设定文本编码器的卸载比例。 |

## 3. Quantization

| 参数 | 作用 |
| --- | --- |
| `Transformer` | 选择主模型量化方式。开启后可降低显存占用。 |
| `Text Encoder` | 选择文本编码器量化方式。 |

## 4. Multistage

| 参数 | 作用 |
| --- | --- |
| `High Noise` | 训练高噪声阶段。 |
| `Low Noise` | 训练低噪声阶段。 |
| `Switch Every` | 多阶段训练时，多少步切换一次阶段。 |

## 5. Target

| 参数 | 作用 |
| --- | --- |
| `Target Type` | 选择训练目标类型，通常是 `LoRA` 或 `LoKr`。 |
| `LoKr Factor` | 仅 `LoKr` 显示。控制 LoKr 分解因子。 |
| `Linear Rank` | LoRA 主秩大小，越大容量越高，显存和过拟合风险也更高。 |
| `Conv Rank` | 仅支持卷积层训练的模型显示。控制卷积 LoRA 容量。 |

## 6. Slider

| 参数 | 作用 |
| --- | --- |
| `Target Class` | Slider 训练的目标类别。 |
| `Positive Prompt` | Slider 正向目标提示词。 |
| `Negative Prompt` | Slider 反向目标提示词。 |
| `Anchor Class` | Slider 锚点类别。 |

## 7. Save

| 参数 | 作用 |
| --- | --- |
| `Data Type` | 保存权重的数据类型，如 `BF16`、`FP16`、`FP32`。 |
| `Save Every` | 每隔多少步保存一次中间权重。 |
| `Max Step Saves to Keep` | 最多保留多少个中间保存点。超过后旧文件会被清理。 |

## 8. Training

| 参数 | 作用 |
| --- | --- |
| `Batch Size` | 每步训练的样本数。显存不足时通常设为 `1`。 |
| `Gradient Accumulation` | 梯度累积步数。可在不增显存的情况下提高等效 batch。 |
| `Steps` | 总训练步数。 |
| `Optimizer` | 优化器类型，如 `AdamW8Bit`、`Adafactor`。 |
| `Learning Rate` | 学习率，决定参数更新强度。 |
| `Weight Decay` | 权重衰减，用于抑制过拟合。 |
| `Timestep Type` | 噪声时间步采样策略，如 `sigmoid`、`linear`、`weighted`。 |
| `Timestep Bias` | 将训练重心偏向高噪声、低噪声或平衡模式。 |
| `Loss Type` | 损失函数类型。默认通常使用 `MSE`。 |
| `Audio Loss Multiplier` | 仅音频相关模型显示。调节音频损失权重。 |
| `Use EMA` | 是否启用指数滑动平均，通常可提升平滑性但训练更慢。 |
| `EMA Decay` | EMA 衰减率。 |
| `Unload TE` | 训练时卸载文本编码器以节省显存。 |
| `Cache Text Embeddings` | 预缓存文本嵌入，减少重复编码开销。 |
| `Differential Output Preservation` | 输出保持正则化，尽量减少模型对非目标区域的破坏。 |
| `DOP Loss Multiplier` | Differential Output Preservation 的损失权重。 |
| `DOP Preservation Class` | DOP 关注的主体类别描述。 |
| `Blank Prompt Preservation` | 使用空提示保持输出稳定，避免 LoRA 过度改写基础能力。 |
| `BPP Loss Multiplier` | Blank Prompt Preservation 的损失权重。 |

## 9. Advanced

| 参数 | 作用 |
| --- | --- |
| `Do Differential Guidance` | 开启差分引导训练。 |
| `Differential Guidance Scale` | 差分引导强度。 |

## 10. Datasets

| 参数 | 作用 |
| --- | --- |
| `Target Dataset` | 主训练图像目录，对应目标图或效果图。 |
| `Control Dataset` | 仅编辑类模型显示。控制图目录，对应原图、条件图或参考图。 |
| `Control Dataset 1/2/3` | 多控制图模型使用的多个条件目录。 |
| `LoRA Weight` | 当前数据集对总训练损失的权重。 |
| `Num Repeats` | 单轮中该数据集重复采样次数。 |
| `Default Caption` | 当图片没有单独 caption 时的默认描述。 |
| `Caption Dropout Rate` | 随机丢弃 caption 的概率，用于降低文本依赖。 |
| `Num Frames` | 视频模型每个样本使用的帧数。 |
| `Cache Latents` | 预缓存 latent，提升后续训练速度，但会占用磁盘。 |
| `Is Regularization` | 标记当前数据集为正则化数据。 |
| `Auto Frame Count` | 自动检测视频帧数。 |
| `Do I2V` | 启用图生视频相关训练逻辑。 |
| `Do Audio` | 启用音频相关训练。 |
| `Audio Normalize` | 对音频做归一化。 |
| `Audio Preserve Pitch` | 音频处理时尽量保持音高。 |
| `Flip X` | 水平翻转增强。 |
| `Flip Y` | 垂直翻转增强。 |
| `Resolutions` | 训练时允许的多分辨率桶。 |

## 11. Sample

| 参数 | 作用 |
| --- | --- |
| `Sample Every` | 每隔多少步生成一次验证样图。 |
| `Sampler` | 采样器类型，通常需和训练噪声调度匹配。 |
| `Guidance Scale` | 采样引导强度。 |
| `Sample Steps` | 单次采样的推理步数。 |
| `Width` | 默认采样宽度。 |
| `Height` | 默认采样高度。 |
| `Num Frames` | 视频采样帧数。 |
| `FPS` | 视频采样帧率。 |
| `Seed` | 默认随机种子。 |
| `Walk Seed` | 开启后每张样图使用变化种子。 |
| `Skip First Sample` | 跳过训练前首次采样。 |
| `Force First Sample` | 强制训练前采样一次。 |
| `Disable Sampling` | 完全关闭训练中的自动采样。 |

### 每条 Sample Prompt 附加参数

| 参数 | 作用 |
| --- | --- |
| `Prompt` | 当前验证样图的提示词。 |
| `Width` | 该条 prompt 的单独宽度，覆盖全局 `Width`。 |
| `Height` | 该条 prompt 的单独高度。 |
| `Seed` | 该条 prompt 的单独随机种子。 |
| `LoRA Scale` | 该条 prompt 的 LoRA 生效强度。 |
| `Control Image` | 编辑类模型采样时使用的控制图。 |
| `Control Image 1/2/3` | 多控制图模型使用的多个采样控制图。 |

## 12. 操作项

| 操作 | 作用 |
| --- | --- |
| `Add Dataset` | 新增一个数据集配置块。 |
| `Add Prompt` | 新增一条采样验证 prompt。 |
| `Advanced` 页签 | 直接编辑完整 YAML。适合添加 UI 未暴露的字段，如 `network.pretrained_lora_path`。 |

## 13. 使用建议
- 先根据模型架构选择正确的 `Model Architecture`，再填写其余字段。
- 显存有限时优先调低 `Linear Rank`、分辨率和 batch，而不是盲目关闭验证采样。
- 如果需要断点续训或增量训练，务必规划好 `Training Name`、输出目录和版本命名。
- 如果 `Simple UI` 没有你需要的字段，改用 `Advanced` 直接写 YAML。
