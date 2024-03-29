import Plugin from '../src'
import * as babel from '@babel/core'
import fs from 'fs'
import path from 'path'
import { expect } from 'chai'
import { evalTransformed } from './evalTransformed'

describe('Transformers', () => {
  
  it('loads markdown as a string', () => {
    const t = babel.transform(
      `import content from './content/markdown.md'
        export default content`,
      {
        filename: __filename,
        plugins: [
          [Plugin, {
            source: './test/content/markdown.md',
            format: 'string',
          }]
        ]
      }
    )
    
    expect(evalTransformed(t)).to.equal(fs.readFileSync(path.join(__dirname, './content/markdown.md'), 'utf-8'))
  })

  it('loads yaml as an object', () => {
    const t = babel.transform(
      `import config from './content/yaml.yaml';
      export default config`,
      {
        filename: __filename,
        plugins: [
          [Plugin, {
            source: './test/content/yaml.yaml',
            format: 'yaml',
          }]
        ]
      }
    )

    expect(evalTransformed(t)).to.deep.equal({ hello: 'world' })
  })

  it('loads toml as an object', async () => {
    const t = await babel.transformAsync(
      `import config from './content/toml.toml';
      export default config`,
      {
        filename: __filename,
        plugins: [
          [Plugin, {
            source: './test/content/toml.toml',
            format: 'toml',
          }]
        ]
      }
    )

    expect(evalTransformed(t)).to.deep.equal({ hello: 'world' })
  })

  it('loads custom transformer', () => {
    const t = babel.transform(
      `import post from './content/frontmatter.md'
      export default post`,
      {
        filename: __filename,
        plugins: [[
          Plugin,
          {
            source: './test/content/frontmatter.md',
            file: /\.md/,
            transform (contents) {
              return {
                contents
              }
            }
          }
        ]]
      }
    )

    expect(evalTransformed(t)).to.deep.equal({
      contents: fs.readFileSync(path.join(__dirname, './content/frontmatter.md'), 'utf-8')
    })
  })
  
})