pipeline {
    agent any
    
    environment {
        SESSION_SECRET = 'clave_segura'
        ADMIN_USER = 'admin'
        ADMIN_PASSWORD = 'supersegura123'
        NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
    }
    
    triggers {
        pollSCM('* * * * *') // poll every minute
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing project dependencies...'
                sh '''
                    echo "Node version:"
                    node -v
                    echo "NPM version:"
                    npm -v
                    
                    apt-get update && apt-get install -y python3 make g++

                    npm ci
                '''
            }
        }

        stage('Build') {
            steps {
                echo 'Building application...'
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                echo 'Running Playwright E2E tests...'
                sh '''
                    npx playwright install chromium
                    npm run test:e2e -- --project=chromium --reporter=list
                '''
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }
        success {
            echo 'Build successful! All tests passed.'
        }
        failure {
            echo 'Build or tests failed! Check logs for details.'
        }
    }
}
