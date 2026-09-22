import { Link, Text } from '@fluentui/react-components'

// §8, final paragraph — the one-line note that closes the contribution
// activity section (and the whole left column).
//
// §16.26: there is no site footer here. This is a plain `<p>`, not a
// `<footer>` landmark — no rule above it, no copyright line, nothing else
// below it. `text/default` is the ambient colour `FluentProvider` sets on its
// root, so the sentence needs no colour of its own; only the link is accented.

export function FooterNote() {
  return (
    // type/small (§12.2), left-aligned by default as a block-level paragraph.
    <Text as="p" size={200} block>
      Seeing something unexpected? Take a look at the{' '}
      {/* accent/primary, underlined at rest (§8) — Fluent's `Link` default
          appearance already underlines at rest. */}
      <Link href="#">profile guide</Link>
      {/* terminal punctuation stays plain text, outside the anchor. */}.
    </Text>
  )
}
