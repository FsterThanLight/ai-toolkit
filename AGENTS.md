# Repository Guidelines

## Project Structure & Module Organization
Core Python code lives in `toolkit/`, with job orchestration in `jobs/` and training/generation flows in `jobs/process/`. Extension points are split between `extensions/` and `extensions_built_in/`. Example configs live in `config/examples/`; runtime outputs go to `output/`, and datasets are typically stored in `datasets/`. The web UI is isolated in `ui/`, with Next.js routes under `ui/src/app/`, shared components in `ui/src/components/`, hooks in `ui/src/hooks/`, and the background worker in `ui/cron/`. Docker files are under `docker/`.

## Build, Test, and Development Commands
Set up Python dependencies with `pip install -r requirements.txt` inside an activated virtualenv. Run a job from a config with `python run.py config/<name>.yaml`, starting from a file in `config/examples/`. Launch the Gradio trainer with `python flux_train_ui.py`. For the web UI, run `cd ui && npm install && npm run dev` for local development, `cd ui && npm run build` for a production build, and `cd ui && npm run lint` before submitting UI changes. Use `docker compose up -d` to start the packaged UI stack.

## Coding Style & Naming Conventions
Follow existing file style instead of reformatting unrelated code. Python uses 4-space indentation, snake_case for functions/modules, and PascalCase for classes like `TrainJob`. Frontend code uses 2-space indentation, PascalCase for React components, and camelCase for hooks/utilities such as `useJobLog`. Prefer descriptive config names like `train_lora_flux_24gb.yaml`. The frontend formatter is Prettier via `cd ui && npm run format`.

## Testing Guidelines
This repository does not expose a top-level automated test command. Most validation lives in targeted scripts under `testing/` and should be run directly, for example `python testing/test_model_load_save.py`. There is also an embedded `unittest` module in `toolkit/image_utils.py`, runnable with `python -m unittest toolkit.image_utils`. Name new test scripts `test_<feature>.py` and keep fixtures or model-path assumptions explicit in the file header.

## Commit & Pull Request Guidelines
Recent history favors short imperative subjects such as `Add support for training LTX 2.3` or `Fix random_noise_multiplier (#738)`. Keep commits focused, use the same style, and add the PR number in parentheses when appropriate. PRs should include a clear summary, any config or model assumptions, and screenshots for `ui/` changes. Link related issues, list manual test commands you ran, and note any GPU, dataset, or Hugging Face token requirements.

## Security & Configuration Tips
Keep secrets in `.env`, especially `HF_TOKEN`, and use `AI_TOOLKIT_AUTH` when exposing the UI outside localhost. Do not commit local dataset paths, generated outputs, or machine-specific credentials.
