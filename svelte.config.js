import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      out: 'dist',
      strict: false, // Disable strict mode
    }),
  },
};
