# FLUX.1-Kontext-dev 衣服印花 LoRA PRD 与训练实施方案

## 1. PRD

### 1.1 项目名称
基于 `FLUX.1-Kontext-dev` 的衣服印花提取与迁移 LoRA 训练方案。

### 1.2 背景
当前项目已经具备 `FLUX.1-Kontext-dev` 训练能力，并支持通过 `datasets[].control_path` 使用成对图像进行编辑类训练。现需求是在该能力基础上，训练一个专注于“衣服印花图案变化”的 LoRA，使模型学习从原图到效果图的印花编辑映射。

### 1.3 产品目标
- 输入原图后，模型能够按提示词将目标印花效果迁移到服装表面。
- 尽量保持人物身份、姿态、服装版型和背景不变。
- 支持后续不断追加新样本，并在已有 LoRA 基础上持续增量训练。

### 1.4 非目标
- 不追求整体人物重绘。
- 不以脸部、发型、背景替换为训练目标。
- 不将“服装结构变化”作为主要学习内容。

### 1.5 功能需求
#### F1. 成对训练
每个样本必须由一张原图和一张效果图组成。项目中应使用：
- `folder_path`: 效果图目录
- `control_path`: 原图目录

源码会按相同文件名自动匹配控制图，例如 `target/0001.jpg` 对应 `control/0001.jpg`。

#### F2. 文本监督
每张效果图需要有同名 `txt` 标注文件，例如 `0001.txt`。标注内容应描述“印花变化指令”，而不是整图重绘目标。

#### F3. 持续增量训练
系统需支持两种继续训练方式：
- 保持相同 `config.name` 和 `training_folder`，自动续接该任务目录下最近保存的权重。
- 使用新的配置名，但设置 `network.pretrained_lora_path`，从指定 LoRA 权重继续训练。

#### F4. 质量稳定
多轮增量训练后，LoRA 仍应保持印花编辑能力，避免明显漂移到人物、背景或服装轮廓。

### 1.6 验收标准
- 使用未见过的原图时，LoRA 可以稳定修改衣服印花。
- 输出中主体结构基本保持一致。
- 至少完成 1 次初训和 1 次增量训练，且增量后原有能力未明显退化。

## 2. 数据集目录规范

### 2.1 推荐目录
建议按训练轮次管理数据，便于持续追加：

```text
datasets/
  kontext_print_lora/
    round_001/
      target/
        0001.jpg
        0001.txt
        0002.jpg
        0002.txt
      control/
        0001.jpg
        0002.jpg
    round_002/
      target/
      control/
```

### 2.2 目录含义
- `target/`: 目标效果图，作为训练主图目录，对应配置中的 `folder_path`
- `control/`: 原图目录，对应配置中的 `control_path`
- `*.txt`: 与 `target/` 中图像同名的标注文件

### 2.3 命名规则
- 原图与效果图必须同名，仅目录不同。
- 建议统一使用四位或六位序号，例如 `0001.jpg`、`0002.jpg`。
- 图片格式优先使用 `jpg` 或 `png`。

### 2.4 标注规范
建议使用英文编辑指令，保持短句、单目标、低歧义。重点描述印花变化，避免加入无关场景词。

推荐示例：

```text
apply [trigger] floral print to the shirt, keep person, pose, garment shape and background unchanged
replace the hoodie graphic with [trigger] streetwear pattern, preserve lighting and composition
change only the clothing print to [trigger] geometric logo pattern
```

不推荐示例：

```text
make this image beautiful
turn this person into a fashion model in a new world
change hair, face, clothes and background
```

### 2.5 数据质检要求
- 原图与效果图构图尽量一致。
- 变化应集中在衣服印花区域。
- 避免大幅裁剪、换背景、换姿态、换服装版型。
- 对于同一批次，尽量覆盖不同人物、角度、光照和衣服材质，避免 LoRA 只记住单一模板。

## 3. 训练实施方案

### 3.1 采用的仓库能力
当前项目可直接使用 [config/examples/train_lora_flux_kontext_24gb.yaml](/mnt/c/Users/23096/PycharmProjects/ai-toolkit/config/examples/train_lora_flux_kontext_24gb.yaml) 作为基础模板。该模板已经包含：
- `model.arch: "flux_kontext"`
- `model.name_or_path: "black-forest-labs/FLUX.1-Kontext-dev"`
- `datasets[].control_path`
- `network.type: "lora"`
- `sample` 阶段的 `--ctrl_img` 控制图采样方式

### 3.2 初训配置建议
建议复制示例配置为 `config/kontext_print_lora_v1.yaml`，并按以下原则调整：

```yaml
job: extension
config:
  name: "kontext_print_lora_v1"
  process:
    - type: "sd_trainer"
      training_folder: "output"
      device: cuda:0
      trigger_word: "pr1ntfx"
      network:
        type: "lora"
        linear: 16
        linear_alpha: 16
      save:
        dtype: float16
        save_every: 250
        max_step_saves_to_keep: 4
        push_to_hub: false
      datasets:
        - folder_path: "datasets/kontext_print_lora/round_001/target"
          control_path: "datasets/kontext_print_lora/round_001/control"
          caption_ext: "txt"
          caption_dropout_rate: 0.05
          shuffle_tokens: false
          cache_latents_to_disk: true
          resolution: [512, 768]
      train:
        batch_size: 1
        steps: 2000
        gradient_accumulation_steps: 1
        train_unet: true
        train_text_encoder: false
        gradient_checkpointing: true
        noise_scheduler: "flowmatch"
        optimizer: "adamw8bit"
        lr: 1e-4
        timestep_type: "weighted"
        dtype: bf16
      model:
        name_or_path: "black-forest-labs/FLUX.1-Kontext-dev"
        arch: "flux_kontext"
        quantize: true
      sample:
        sampler: "flowmatch"
        sample_every: 250
        width: 1024
        height: 1024
        guidance_scale: 4
        sample_steps: 20
        prompts:
          - "apply [trigger] floral print to the shirt, keep the person and garment shape unchanged --ctrl_img datasets/kontext_print_lora/round_001/control/0001.jpg"
```

### 3.3 参数建议说明
- `linear: 16`: 作为首版默认值，先保证稳定性；若印花细节非常复杂，可试 `32`。
- `resolution: [512, 768]`: 示例配置已说明 Kontext 在 24GB VRAM 下跑 `1024` 训练可能 OOM。
- `steps: 2000`: 作为首轮起点，建议结合采样结果决定是否扩展到 `3000-4000`。
- `train_text_encoder: false`: 与示例保持一致，避免增加不必要显存压力和漂移。
- `trigger_word`: 建议保留，用于固定印花能力入口，便于后续推理和增量训练保持一致。

### 3.4 训练命令

```bash
python run.py config/kontext_print_lora_v1.yaml
```

### 3.5 采样与验证
每次保存节点检查以下内容：
- 印花是否被正确替换到服装表面
- 人物面部、手部、背景是否被意外改写
- 服装轮廓是否保持
- 同一提示词在不同原图上的迁移是否稳定

若出现“整图被重画”或“背景跟着变化”，优先检查：
- 标注是否写得过于宽泛
- 训练集中是否存在大量非印花变化
- 步数是否过高导致过拟合

## 4. 增量训练流程

### 4.1 目标定义
本项目中的“无限叠加训练”应按“可重复增量训练”理解，即 LoRA 可以在已有权重基础上继续学习新批次数据。源码已支持该流程，但效果稳定性仍依赖数据质量、学习率和验证策略，不应理解为无条件无限累积而不退化。

### 4.2 流程 A：同任务自动续训
适用于训练中断或希望继续同一轮次。

执行条件：
- `config.name` 不变
- `training_folder` 不变

行为：
- 项目会在 `output/<name>/` 下查找最近保存的权重并继续训练。

适用场景：
- 训练被中断
- 首轮还未收敛，需继续补步数

### 4.3 流程 B：基于既有 LoRA 开启新一轮增量训练
适用于新增了一批训练数据，希望在上一版 LoRA 基础上继续学习。

推荐做法：
1. 新增一轮数据目录，如 `datasets/kontext_print_lora/round_002/`
2. 新建配置文件，如 `config/kontext_print_lora_v2.yaml`
3. 修改 `config.name`
4. 在 `network` 下增加 `pretrained_lora_path`

示例：

```yaml
network:
  type: "lora"
  linear: 16
  linear_alpha: 16
  pretrained_lora_path: "output/kontext_print_lora_v1/kontext_print_lora_v1.safetensors"
```

建议同时调整：
- `lr` 下调到 `5e-5` 或更低
- `steps` 控制在 `500-1500`
- 继续沿用同一个 `trigger_word`

### 4.4 增量训练的数据策略
为降低遗忘，推荐不要只喂新数据。建议每次增量训练都包含：
- 新增样本
- 少量历史高质量样本
- 少量困难样本和失败案例修正样本

如果新旧数据差异很大，优先分批次小步训练，而不是一次性高步数叠加。

### 4.5 版本管理建议
建议采用以下命名：
- `kontext_print_lora_v1`
- `kontext_print_lora_v2`
- `kontext_print_lora_v3`

同时保留：
- 每版配置文件
- 每版代表性采样图
- 每版训练所用数据批次记录

## 5. 风险与控制建议

### 5.1 主要风险
- 数据变化不只集中在印花，导致模型学偏
- 增量训练只使用新数据，导致历史能力遗忘
- 步数过高，造成印花之外的区域被重写
- caption 不稳定，导致指令语义漂移

### 5.2 控制手段
- 保持标注模板统一
- 每轮增量时混入历史样本
- 每 250 步固定采样验证
- 当增量训练开始出现漂移时，优先降学习率，而不是继续加步数

## 6. 结论
基于当前仓库内容，本需求可以直接落在 `FLUX.1-Kontext-dev + paired dataset + LoRA incremental training` 这条链路上，无需额外开发新的训练框架。实现重点不在于模型接入，而在于：
- 严格执行 `target/control` 成对数据规范
- 让标注只描述印花变化
- 用 `pretrained_lora_path` 和版本化数据批次实现稳定增量训练
