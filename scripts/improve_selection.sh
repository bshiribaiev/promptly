#!/usr/bin/env bash

# Improve selected text by calling the local backend /ask endpoint
# Usage examples:
#   echo "Make this better" | scripts/improve_selection.sh
#   pbpaste | scripts/improve_selection.sh | pbcopy

set -euo pipefail

BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8081}"
TEMPLATE_ID="${TEMPLATE_ID:-improve_prompt}"

# Read all stdin as the input text
INPUT_TEXT="$(cat -)"

if [[ -z "${INPUT_TEXT//[[:space:]]/}" ]]; then
  # Nothing to improve; echo back
  echo "${INPUT_TEXT}"
  exit 0
fi

# Build JSON safely using jq (required)
if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required. Install via: brew install jq" >&2
  echo "${INPUT_TEXT}"
  exit 0
fi

PAYLOAD=$(jq -n --arg text "$INPUT_TEXT" --arg tid "$TEMPLATE_ID" '{text:$text, templateId:$tid, returnAnswer:true}')

# Call backend; prefer the LLM answer, fallback to rendered prompt
RESPONSE=$(curl -sS -X POST \
  -H 'Content-Type: application/json' \
  -d "$PAYLOAD" \
  "$BACKEND_URL/ask" || true)

IMPROVED=$(printf '%s' "$RESPONSE" | jq -r '.answer // .prompt // empty')

if [[ -n "$IMPROVED" ]]; then
  printf '%s' "$IMPROVED"
else
  # On failure, return original text so selection is not lost
  printf '%s' "$INPUT_TEXT"
fi


