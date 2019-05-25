describe('Executer', function() {
  var executer;

  beforeEach(function() {
    executer = new Executer(ModeList.NORMAL_MODE, 'a');
  });

  it('should be fixed a candidate', function() {
    expect(executer.fixedCandidate()).toBe(true);
    expect(executer.noCandidate()).toBe(false);
  });
});