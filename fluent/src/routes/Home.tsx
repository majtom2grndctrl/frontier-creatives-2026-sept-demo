import { Body1, Card, Title1, makeStyles, tokens } from '@fluentui/react-components'
import { Link } from 'react-router'
import { PROTOTYPES } from '@/prototypes'

// griffel is the default for component-level styles.
const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalXXL,
    maxWidth: '64rem',
  },
  intro: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: tokens.spacingVerticalS,
    maxWidth: '72ch',
  },
  lede: {
    color: tokens.colorNeutralForeground2,
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))',
    gap: tokens.spacingHorizontalL,
    listStyleType: 'none',
    margin: '0',
    padding: '0',
  },
  card: {
    // the card is a link target as a whole; the stretched anchor below covers it.
    position: 'relative',
    height: '100%',
    rowGap: tokens.spacingVerticalS,
  },
  name: {
    margin: '0',
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase500,
    fontWeight: tokens.fontWeightSemibold,
  },
  link: {
    color: tokens.colorNeutralForeground1,
    textDecorationLine: 'none',
    ':hover': {
      color: tokens.colorBrandForeground1,
      textDecorationLine: 'underline',
    },
    // stretch the anchor over the card so the whole surface is the hit target
    // while the accessible name stays just the prototype's name.
    '::after': {
      content: '""',
      position: 'absolute',
      inset: '0',
      borderRadius: tokens.borderRadiusMedium,
    },
    ':focus-visible': {
      outlineStyle: 'none',
    },
    ':focus-visible::after': {
      outlineWidth: tokens.strokeWidthThick,
      outlineStyle: 'solid',
      outlineColor: tokens.colorStrokeFocus2,
    },
  },
  description: {
    color: tokens.colorNeutralForeground2,
  },
})

export function Home() {
  const styles = useStyles()

  return (
    <div className={styles.page}>
      <section className={styles.intro}>
        <Title1 as="h1">Fluent UI React v9</Title1>
        <Body1 className={styles.lede}>
          The same two build specs, implemented against Microsoft&rsquo;s Fluent design
          language. Each prototype is its own product with its own chrome &mdash; only
          this index is shared.
        </Body1>
      </section>

      <ul className={styles.list}>
        {PROTOTYPES.map((prototype) => (
          <li key={prototype.path}>
            <Card className={styles.card}>
              <h2 className={styles.name}>
                <Link to={prototype.path} className={styles.link}>
                  {prototype.name}
                </Link>
              </h2>
              <Body1 className={styles.description}>{prototype.description}</Body1>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
