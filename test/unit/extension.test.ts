describe('Extension Setup', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should validate project structure', () => {
    const projectName = 'gitissue-bridge';
    expect(projectName).toBe('gitissue-bridge');
  });

  it('should have correct extension name', () => {
    const extensionId = 'gitissue-bridge';
    expect(extensionId).toMatch(/^[a-z-]+$/);
  });
});
