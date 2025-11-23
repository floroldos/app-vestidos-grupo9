pipeline {
    agent any
    
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
                script {
                    if (isUnix()) {
                        sh 'npm ci'
                    } else {
                        bat 'npm ci'
                    }
                }
            }
        }

        stage('Build') {
            steps {
                echo 'Building application...'
                script {
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm run build'
                    }
                }
            }
        }

        stage('Test') {
            steps {
                echo 'Running Playwright E2E tests...'
                script {
                    if (isUnix()) {
                        sh '''
                            npx playwright install chromium
                            npm run test:e2e -- --project=chromium --reporter=list
                        '''
                    } else {
                        bat '''
                            npx playwright install chromium
                            npm run test:e2e -- --project=chromium --reporter=list
                        '''
                    }
                }
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