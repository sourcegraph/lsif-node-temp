FROM sourcegraph/src-cli:3.31.0@sha256:3b4c76b5a50eb297e96eb7cb8438a109b1b8e2e3aa0f4f90874f05851cf02b64 AS src-cli

FROM node:14.5-alpine3.10@sha256:7fb1e608dc4081c25930db83cb4a5df884b6a3f6e4e9f5fa2df08f22778fcfad

ARG TAG

RUN apk add --no-cache git

COPY --from=src-cli /usr/bin/src /usr/bin

RUN npm install -g @sourcegraph/lsif-tsc@${TAG}

CMD ["/bin/sh"]
