import Plugin from '../src'
import * as fs from 'fs'
import * as path from 'path'
import * as babel from '@babel/core'
import { expect } from 'chai'
import { evalTransformed } from './evalTransformed'
import { mkdirp } from 'mkdirp'


describe('Directory', () => {
  it('loads a directory as an array', () => {
    const t = babel.transform(
      `import vals from './content/posts'
        export default vals`,
      {
        filename: __filename,
        plugins: [
          [Plugin, {
            source: './test/content/posts',
            filter: /\.js$/,
          }]
        ]
      }
    )

    expect(evalTransformed(t)).to.deep.equal([{ default: 1 }, { default: 2 }])
  }).timeout(5000)

  it('loads directory and transforms files', () => {
    const t = babel.transform(
      `import vals from './content/posts'
      export default vals`,
      {
        filename: __filename,
        plugins: [
          [Plugin, {
            source: ['./test/content/posts'],
            filter: { test: p => p.endsWith('.md') },
            format: 'string',
          }]
        ]
      }
    )

  
    const res = evalTransformed(t)
    expect(res).to.deep.include(fs.readFileSync(path.join(__dirname, './content/posts/one.md'), 'utf-8'))
    expect(res).to.deep.include(fs.readFileSync(path.join(__dirname, './content/posts/two.md'), 'utf-8'))
    expect(res).to.deep.include(fs.readFileSync(path.join(__dirname, './content/posts/three-test.md'), 'utf-8'))

  }).timeout(5000)

  it('handles trailing slashes in imports', () => {
    const t = babel.transform(
      `import vals from './content/posts/'
      export default vals`,
      {
        filename: __filename,
        plugins: [
          [Plugin, {
            source: ['./test/content/posts'],
            filter: { test: p => p.endsWith('.md') },
            format: 'string',
          }]
        ]
      }
    )

    const res = evalTransformed(t)
    expect(res).to.deep.include(fs.readFileSync(path.join(__dirname, './content/posts/one.md'), 'utf-8'))
    expect(res).to.deep.include(fs.readFileSync(path.join(__dirname, './content/posts/two.md'), 'utf-8'))
    expect(res).to.deep.include(fs.readFileSync(path.join(__dirname, './content/posts/three-test.md'), 'utf-8'))

  })

  it('loads multiple instances', () => {
    const t = babel.transform(
      `import vals from './content/posts'
       import vals2 from './content'
      export default vals.concat(vals2)`,
      {
        filename: __filename,
        plugins: [
          [Plugin, {
            source: ['./test/content/posts'],
            filter: { test: p => p.endsWith('.md') },
            format: 'string',
          }],
          [Plugin, {
            source: './test/content/',
            filter: { test: p => p.endsWith('.md') },
            format: 'string',
          }, 'word'],
        ]
      }
    )

    const res = evalTransformed(t)
    expect(res).to.deep.include(fs.readFileSync(path.join(__dirname, './content/posts/one.md'), 'utf-8'))
    expect(res).to.deep.include(fs.readFileSync(path.join(__dirname, './content/posts/two.md'), 'utf-8'))
    expect(res).to.deep.include(fs.readFileSync(path.join(__dirname, './content/posts/three-test.md'), 'utf-8'))
    expect(res).to.deep.include(fs.readFileSync(path.join(__dirname, './content/frontmatter.md'), 'utf-8'))
    expect(res).to.deep.include(fs.readFileSync(path.join(__dirname, './content/markdown.md'), 'utf-8'))
  })

})