FROM public.ecr.aws/docker/library/node:14-alpine as ts-compiler
WORKDIR /usr/app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install
COPY . ./
RUN npm run build

FROM public.ecr.aws/docker/library/node:14-alpine as ts-remover
WORKDIR /usr/app
COPY --from=ts-compiler /usr/app/package*.json ./
COPY --from=ts-compiler /usr/app/dist ./
RUN npm install --only=production

FROM public.ecr.aws/lambda/nodejs:14
RUN yum install -y amazon-linux-extras
RUN amazon-linux-extras enable GraphicsMagick1.3 libreoffice && yum clean metadata && yum install -y libreoffice GraphicsMagick

COPY --from=ts-remover /usr/app ./

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "app.handler" ]  