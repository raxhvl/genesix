# Genesix 🌌

The first six days of your web3 origin story.

## Getting Started

### 📁 Project Structure

```shell
📁 genesix
├── 📁 app/                  # Next.js application directory
│   ├── 📄 layout.tsx        # Root layout for Next.js app
│   ├── 📄 page.tsx          # Home page
│   ├── 📁 styles/           # Next.js specific styles
│   │   └── 📄 global.css
│   └── 📄 ...
├── 📁 contracts/             # Foundry project directory
│   ├── 📄 foundry.toml       # Foundry configuration file
│   ├── 📁 src/               # Solidity contracts
│   │   ├── 📄 MyContract.sol
│   │   └── 📄 ...
│   ├── 📁 script/            # Deployment and interaction scripts
│   │   ├── 📄 Deploy.s.sol
│   │   └── 📄 ...
│   ├── 📁 test/              # Solidity tests
│   │   ├── 📄 MyContract.t.sol
│   │   └── 📄 ...
│   ├── 📁 lib/               # External libraries
│   ├── 📁 out/               # Compiled contract artifacts (ignored in git)
│   └── 📄 ...                # Other Foundry files
├── 📁 public/                # Static assets for Next.js
├── 📄 .gitignore             # Git ignore file
├── 📄 next.config.js         # Next.js configuration
├── 📄 package.json           # Project dependencies
├── 📄 tsconfig.json          # TypeScript configuration (if using)
└── 📄 README.md              # Project documentation
```

### Front end

The front end is built using [nextjs](https://nextjs.org/docs).
To run a development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Smart contracts

The smart contracts are built using [Foundry](https://book.getfoundry.sh/), located in the `./contracts` folder.

To build and test smart contracts:

```bash
cd contracts
forge build
forge test
```

## Acknowledgments

- The first prototype was built using [v0.dev](https://v0.dev/)
- The landing page is a fork of [this page](https://v0.dev/chat/community/background-paths-s2R42ut7CxT) by knockout

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Disclaimer

⚠️ This software is experimental and provided "as is" without warranty of any kind. The software may contain bugs, errors, or security vulnerabilities.

- Not recommended for production use without thorough testing
- No guarantee of functionality or security
- Users assume all risks associated with usage
- Authors and contributors are not liable for any damages or losses

Please review the code and test thoroughly before any serious use.
