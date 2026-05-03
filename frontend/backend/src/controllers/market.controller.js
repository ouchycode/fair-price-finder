exports.getTrends = async (req, res) => {
  // TODO: ambil dari DB / ML output
  res.json({ message: 'Market trends endpoint', data: [] });
};

exports.getCategories = async (req, res) => {
  const categories = [
    'Web Development', 'Mobile Development', 'UI/UX Design',
    'Data Science', 'Content Writing', 'Digital Marketing',
    'Video Editing', 'Graphic Design', 'SEO', 'Copywriting'
  ];
  res.json({ categories });
};
