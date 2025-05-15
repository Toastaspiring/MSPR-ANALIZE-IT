#!/bin/bash

# Attendre que SonarQube soit prêt
echo "Waiting for SonarQube to be available..."
until curl -s -u admin:admin http://host.docker.internal:9000/api/system/health | grep -q '"status":"GREEN"'; do
  sleep 5
done

echo "SonarQube is up. Configuring..."

# Changer le mot de passe admin
curl -s -u admin:admin -X POST "http://host.docker.internal:9000/api/users/change_password?login=admin&previousPassword=admin&password=newpassword"

# Créer un token pour l’analyse
curl -s -u admin:newpassword -X POST "http://host.docker.internal:9000/api/user_tokens/generate?name=ci-token"

# Créer un projet (ex: `my-github-repo`)
curl -s -u admin:newpassword -X POST "http://host.docker.internal:9000/api/projects/create?name=my-github-repo&project=my-github-repo"

echo "Configuration done."
