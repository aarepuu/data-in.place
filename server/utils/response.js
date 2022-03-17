module.exports = {
  success: (res, data) => {
    res.json({
      meta: {
        success: true,
        messages: []
      },
      data
    });
  },

  failed: (res, messages, data) => {
    res.status(400).json({
      meta: {
        success: false,
        messages
      },
      data
    });
  },

  forbidden: (res, messages, data) => {
    res.status(403).json({
      meta: {
        success: false,
        messages
      },
      data
    });
  }
};
