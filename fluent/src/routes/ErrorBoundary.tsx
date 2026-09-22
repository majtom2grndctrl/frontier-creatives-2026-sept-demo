import {
  Body1,
  Link,
  Title2,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { isRouteErrorResponse, useRouteError } from 'react-router'

const useStyles = makeStyles({
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    rowGap: tokens.spacingVerticalM,
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
  },
  message: {
    color: tokens.colorNeutralForeground2,
  },
})

function describeError(error: unknown): { heading: string; message: string } {
  if (isRouteErrorResponse(error)) {
    return {
      heading: `${error.status} ${error.statusText}`,
      message:
        error.status === 404
          ? 'We could not find that page.'
          : 'Something went wrong while loading this route.',
    }
  }

  if (error instanceof Error) {
    return { heading: 'Something went wrong', message: error.message }
  }

  return {
    heading: 'Something went wrong',
    message: 'An unexpected error stopped this page from rendering.',
  }
}

export function ErrorBoundary() {
  const styles = useStyles()
  const { heading, message } = describeError(useRouteError())

  return (
    <main className={styles.page}>
      <Title2 as="h1">{heading}</Title2>
      <Body1 className={styles.message}>{message}</Body1>
      <Link as="a" appearance="subtle" href="/">
        Back to home
      </Link>
    </main>
  )
}
