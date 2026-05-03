# FLUX.1-Kontext-dev 衣服印花 LoRA UI 参数推荐

## 适用范围
本文档基于 [FLUX.1-Kontext-dev衣服印花提取LoRA需求说明.md](/mnt/c/Users/23096/PycharmProjects/ai-toolkit/说明文档/FLUX.1-Kontext-dev衣服印花提取LoRA需求说明.md) 的需求编写，用于指导在 AI-Toolkit UI 中创建 `FLUX.1-Kontext-dev` 训练任务，目标是训练“衣服印花提取与替换” LoRA。

## 1. 训练前准备

在 UI 填参前，先确认：
- 已接受 `black-forest-labs/FLUX.1-Kontext-dev` 的 Hugging Face 许可
- 已配置 `HF_TOKEN`
- 已准备成对数据集

推荐目录：

```text
datasets/
  kontext_print_lora/
    round_001/
      target/
        0001.jpg
        0001.txt
      control/
        0001.jpg
```

其中：
- `target/` 放效果图和同名 `txt`
- `control/` 放原图

## 2. UI 推荐填写

### 2.1 Job

| 参数 | 推荐值 | 说明 |
| --- | --- | --- |
| `Training Name` | `kontext_print_lora_v1` | 首版训练名称，后续增量可用 `v2`、`v3` |
| `GPU ID` | 你的训练 GPU | 单卡训练直接选目标卡 |
| `Trigger Word` | `pr1ntfx` | 建议固定，便于采样和增量训练保持一致 |

### 2.2 Model

| 参数 | 推荐值 | 说明 |
| --- | --- | --- |
| `Model Architecture` | `FLUX.1-Kontext-dev` | 必选 |
| `Name or Path` | `black-forest-labs/FLUX.1-Kontext-dev` | 基础模型 |
| `Low VRAM` | 关闭 | 显存不够再开启 |

### 2.3 Quantization

| 参数 | 推荐值 | 说明 |
| --- | --- | --- |
| `Transformer` | 保持默认量化，如 `qfloat8` | 降低显存压力 |
| `Text Encoder` | 保持默认量化，如 `qfloat8` | 通常不需要改 |

### 2.4 Target

| 参数 | 推荐值 | 说明 |
| --- | --- | --- |
| `Target Type` | `LoRA` | 当前任务不建议用 `LoKr` 起步 |
| `Linear Rank` | `16` | 首版建议值；印花特别复杂时再试 `32` |

### 2.5 Save

| 参数 | 推荐值 | 说明 |
| --- | --- | --- |
| `Data Type` | `BF16` | 显卡支持 BF16 时优先；否则 `FP16` |
| `Save Every` | `250` | 便于及时检查漂移 |
| `Max Step Saves to Keep` | `4` | 足够保留多个中间版本 |

### 2.6 Training

| 参数 | 推荐值 | 说明 |
| --- | --- | --- |
| `Batch Size` | `1` | Kontext 通常从 1 开始最稳妥 |
| `Gradient Accumulation` | `1` | 显存允许时保持简单 |
| `Steps` | `2000` | 首轮建议起点 |
| `Optimizer` | `AdamW8Bit` | 与示例配置一致 |
| `Learning Rate` | `0.0001` | 首轮标准起点 |
| `Weight Decay` | `0.0001` | 保守设置 |
| `Timestep Type` | `Weighted` | `flux_kontext` 默认推荐 |
| `Timestep Bias` | `Balanced` | 初训建议平衡 |
| `Loss Type` | `MSE` | 默认即可 |
| `Use EMA` | 关闭 | 先保证训练链路稳定 |
| `Unload TE` | 关闭 | 先不要叠加额外复杂度 |
| `Cache Text Embeddings` | 关闭 | 先遵循基础配置 |
| `Differential Output Preservation` | 视效果开启 | 如果训练中出现背景或人物被明显改写，可再打开 |

### 2.7 Datasets

| 参数 | 推荐值 | 说明 |
| --- | --- | --- |
| `Target Dataset` | `datasets/kontext_print_lora/round_001/target` | 效果图目录 |
| `Control Dataset` | `datasets/kontext_print_lora/round_001/control` | 原图目录 |
| `LoRA Weight` | `1.0` | 单数据集时保持默认 |
| `Num Repeats` | `1` | 先不用靠重复次数放大数据 |
| `Default Caption` | 留空 | 使用每张图自己的 `txt` |
| `Caption Dropout Rate` | `0.05` | 与示例一致 |
| `Cache Latents` | 开启 | 提高后续训练速度 |
| `Is Regularization` | 关闭 | 当前不是正则化集 |
| `Flip X` | 关闭 | 衣服印花方向敏感时不建议先开 |
| `Flip Y` | 关闭 | 通常不建议开 |
| `Resolutions` | 勾选 `512`、`768` | 24GB VRAM 下较稳妥 |

## 3. Caption 推荐写法

caption 只描述印花变化，不要描述整体重绘。推荐示例：

```text
apply [trigger] floral print to the shirt, keep person, pose, garment shape and background unchanged
replace the hoodie graphic with [trigger] streetwear pattern, preserve lighting and composition
change only the clothing print to [trigger] geometric logo pattern
```

不推荐：

```text
make this image beautiful
change hair, face, clothes and background
turn this person into a new scene
```

## 4. Sample 推荐填写

| 参数 | 推荐值 | 说明 |
| --- | --- | --- |
| `Sample Every` | `250` | 每次保存点采样检查 |
| `Sampler` | `FlowMatch` | 应与训练配置匹配 |
| `Guidance Scale` | `4` | 与示例一致 |
| `Sample Steps` | `20` | 基础验证足够 |
| `Width` | `1024` | 验证图尺寸 |
| `Height` | `1024` | 验证图尺寸 |
| `Seed` | `42` | 固定观察训练变化 |
| `Walk Seed` | 开启或关闭均可 | 关闭便于对比，开启便于看泛化 |
| `Skip First Sample` | 可开启 | 减少训练前等待 |
| `Disable Sampling` | 关闭 | 当前任务必须保留验证采样 |

推荐 Sample Prompt：

```text
apply [trigger] floral print to the shirt, keep the person and garment shape unchanged
```

同时给该条 sample 指定一张 `Control Image`，使用真实原图做验证。

## 5. 增量训练推荐

### 5.1 同任务续训
如果只是训练中断或首轮步数不够：
- 保持 `Training Name` 不变
- 保持输出目录不变

项目会优先续接最近保存的权重。

### 5.2 新一轮增量训练
如果你新增了一批对比图，建议：
- 新数据放到 `round_002/`
- `Training Name` 改为 `kontext_print_lora_v2`
- `Trigger Word` 保持 `pr1ntfx`
- `Learning Rate` 下调到 `0.00005`
- `Steps` 控制在 `500-1500`

注意：`Simple UI` 没有单独暴露 `pretrained_lora_path`。如果你要在已有 LoRA 基础上继续叠加训练，需要切换到 `Advanced`，在 YAML 中加入：

```yaml
config:
  process:
    - network:
        pretrained_lora_path: "output/kontext_print_lora_v1/kontext_print_lora_v1.safetensors"
```

## 6. 训练中重点观察

每次采样重点看：
- 印花是否真的落在衣服表面
- 人物脸部和背景是否被意外改写
- 衣服版型是否保持
- 新图上的迁移是否稳定

如果出现漂移，优先处理：
1. 检查 caption 是否写得过宽
2. 检查数据是否存在大量非印花变化
3. 降低学习率
4. 降低增量训练步数

## 7. 结论
对于这次需求，UI 最关键的三项是：
- `Model Architecture = FLUX.1-Kontext-dev`
- `Target Dataset = 效果图目录`
- `Control Dataset = 原图目录`

其余推荐可概括为：`rank 16 + steps 2000 + lr 1e-4 + resolution 512/768 + sample every 250`。这是一套适合首版验证的稳妥起点。
