# Local development server only, not a production web image.
FROM node:24.19.0-bookworm-slim@sha256:a9f5f7c91a432850b2a8a7797adf5eadb6c733ceed61167806cee7ea7fbc29df
RUN npm install --global npm@11.17.0 --ignore-scripts --no-audit --no-fund
WORKDIR /workspace
RUN chown node:node /workspace
COPY --chown=node:node .node-version .npmrc ./
COPY --chown=node:node scripts/check-node.mjs scripts/check-node.mjs
COPY --chown=node:node apps/web/ apps/web/
USER node
WORKDIR /workspace/apps/web
RUN node ../../scripts/check-node.mjs && npm ci --ignore-scripts --no-audit --no-fund
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
