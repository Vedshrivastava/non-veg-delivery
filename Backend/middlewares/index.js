import JWT from "jsonwebtoken";

const signTokenForConsumer = async (user) => {
  if (!user || !user.id) {
    console.error('Invalid user object:', user);
    return null;
  }

  console.log("userID: ---", user.id);

  return JWT.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_KEY_CONSUMER,
    {
      expiresIn: '1d',
    }
  );
};

const signTokenForAdmin = async (user) => {
  return JWT.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_KEY_ADMIN,
    {
      expiresIn: "1d",
    }
  );
};

// New function for signing token for MANAGER
const signTokenForManager = async (user) => {
  return JWT.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_KEY_MANAGER, // Make sure this environment variable is set
    {
      expiresIn: "1d",
    }
  );
};

export { signTokenForConsumer, signTokenForAdmin, signTokenForManager };
