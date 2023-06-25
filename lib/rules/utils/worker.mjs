import { runAsWorker } from 'synckit'
import { createLinter, loadTextlintrc } from 'textlint'

const isTextLintFixResult = result => 'output' in result
let textLinter = null

runAsWorker(
  async ({
    text,
    fix,
  }) => {
    if (!textLinter) {
      const descriptor = await loadTextlintrc()
      textLinter = createLinter({
        descriptor,
      })
    }
    const result = await textLinter[fix ? 'fixText' : 'lintText'](text, 'test.txt')
    return {
      messages: result.messages,
      content: isTextLintFixResult(result) ? result.output : text,
    }
  },
)
