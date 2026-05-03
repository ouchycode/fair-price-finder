exports.getAllSkills = async (req, res) => {
  // TODO: ambil dari DB
  res.json({ message: 'Skills endpoint', data: [] });
};

exports.getPopularSkills = async (req, res) => {
  res.json({ message: 'Popular skills endpoint', data: [] });
};
