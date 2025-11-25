pipeline {
    agent {
        docker {
            image 'node:22-bullseye'   
            args '-u root'            
        }
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
                    node -v
                    npm -v
                    apt-get update
                    apt-get install -y build-essential python3

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
