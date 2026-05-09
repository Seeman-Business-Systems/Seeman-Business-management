import Staff from './staff';

describe('Staff (domain)', () => {
  const build = (overrides: Partial<{ middleName: string; initialPasswordChanged: boolean }> = {}) =>
    new Staff(
      1,
      'Ifeoma',
      'Eze',
      '+2348031000004',
      4,
      1,
      new Date(),
      new Date(),
      'hashed-password',
      0,
      overrides.initialPasswordChanged ?? true,
      undefined,
      overrides.middleName,
      'ifeoma@seeman.com',
    );

  it('builds full name without a middle name', () => {
    expect(build().getFullName()).toBe('Ifeoma Eze');
  });

  it('builds full name with a middle name', () => {
    expect(build({ middleName: 'Chioma' }).getFullName()).toBe('Ifeoma Chioma Eze');
  });

  it('exposes role and branch scope', () => {
    const staff = build();
    expect(staff.getRoleId()).toBe(4);
    expect(staff.getBranchId()).toBe(1);
  });

  it('reports password setup completion via initialPasswordChanged', () => {
    expect(build({ initialPasswordChanged: false }).getInitialPasswordChanged()).toBe(false);
    expect(build({ initialPasswordChanged: true }).getInitialPasswordChanged()).toBe(true);
  });

  it('updates last login timestamp', () => {
    const staff = build();
    const at = new Date('2026-05-04T08:00:00Z');
    staff.setLastLoginAt(at);
    expect(staff.getLastLoginAt()).toEqual(at);
  });

  it('updates personal details through setters', () => {
    const staff = build();
    staff.setFirstName('Adaeze');
    staff.setLastName('Okafor');
    staff.setMiddleName('Chioma');
    staff.setEmail('adaeze@seeman.com');
    staff.setPhoneNumber('+2348099999999');

    expect(staff.getFirstName()).toBe('Adaeze');
    expect(staff.getLastName()).toBe('Okafor');
    expect(staff.getMiddleName()).toBe('Chioma');
    expect(staff.getEmail()).toBe('adaeze@seeman.com');
    expect(staff.getPhoneNumber()).toBe('+2348099999999');
  });

  it('records role transfers via setRoleId/setBranchId', () => {
    const staff = build();
    staff.setRoleId(3);
    staff.setBranchId(2);
    expect(staff.getRoleId()).toBe(3);
    expect(staff.getBranchId()).toBe(2);
  });

  it('flags initial password as changed once setup is complete', () => {
    const staff = build({ initialPasswordChanged: false });
    staff.setInitialPasswordChanged(true);
    staff.setPassword('new-hashed');
    expect(staff.getInitialPasswordChanged()).toBe(true);
    expect(staff.getPassword()).toBe('new-hashed');
  });

  it('soft-deletes via deletedAt', () => {
    const staff = build();
    const at = new Date('2026-12-01');
    staff.setDeletedAt(at);
    expect(staff.getDeletedAt()).toEqual(at);
  });

  it('updates joinedAt and audit timestamps', () => {
    const staff = build();
    const joined = new Date('2026-01-01');
    const updated = new Date('2026-02-01');
    const created = new Date('2025-12-01');
    staff.setJoinedAt(joined);
    staff.setUpdatedAt(updated);
    staff.setCreatedAt(created);
    staff.setCreatedBy(2);
    expect(staff.getJoinedAt()).toEqual(joined);
    expect(staff.getUpdatedAt()).toEqual(updated);
    expect(staff.getCreatedAt()).toEqual(created);
    expect(staff.getCreatedBy()).toBe(2);
  });
});
