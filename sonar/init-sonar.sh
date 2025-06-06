#!/bin/bash

# Attendre que SonarQube soit prêt
echo "Waiting for SonarQube to be available..."
until curl -s -u admin:admin http://localhost:9000/api/system/health | grep -q '"health":"GREEN"'; do
  sleep 5
done

echo "SonarQube is up. Configuring..."

# Changer le mot de passe admin
curl -s -u admin:admin -X POST "http://localhost:9000/api/users/change_password?login=admin&previousPassword=admin&password=P75:5,0_I7lh"

# Créer un token pour l’analyse
# curl -s -u admin:P75:5,0_I7lh -X POST "http://localhost:9000/api/user_tokens/generate?name=ci-token"

# Créer un projet (ex: `my-github-repo`)
curl -s -u admin:P75:5,0_I7lh -X POST "http://localhost:9000/api/projects/create?name=my-github-repo&project=etl"

curl -s -u admin:P75:5,0_I7lh -X POST "http://localhost:9000/api/projects/create?name=my-github-repo&project=ia"

echo "Configuration done."

# squ_8ab30107f5ed7292c965c725787411e81a3dcd13

# sonar  -Dsonar.host.url=http://localhost:9000   -Dsonar.token=squ_8ab30107f5ed7292c965c725787411e81a3dcd13
