// Role keys match the existing Sidebar and Topbar configuration.
const templeBanner = {
  variant: 'temple',
  description: ['Together we preserve our heritage', 'and serve the community.'],
};

export const bannerRoles = {
  family: {
    variant: 'family',
    description: ['Stay connected with your temple', 'and community.'],
  },
  templeAdmin: templeBanner,
  coAdmin: templeBanner,
  superAdmin: {
    variant: 'system',
    description: ['Manage temples, users, and system operations', 'across Sri Lanka.'],
  },
};
