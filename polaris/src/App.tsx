export default function App() {
  return (
    <s-page inlineSize="small">
      <s-stack direction="block" gap="large" alignItems="center">
        <s-badge>polaris</s-badge>
        <s-section heading="Ready to build">
          <s-stack direction="block" gap="base" alignItems="start">
            <s-paragraph>
              Polaris web components are installed. Swap this page for whatever
              the crowd suggests.
            </s-paragraph>
            <s-button variant="primary">It works</s-button>
          </s-stack>
        </s-section>
      </s-stack>
    </s-page>
  );
}
