import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

def run_eda(filepath='dataset/heart_disease_health_indicators_BRFSS2015.csv', output_dir='images/eda'):
    """Runs EDA on the given dataset and saves visualizations to output_dir."""
    os.makedirs(output_dir, exist_ok=True)
    df = pd.read_csv(filepath)
    
    # 1. Class Distribution
    plt.figure(figsize=(6, 4))
    sns.countplot(data=df, x='HeartDiseaseorAttack', palette='viridis')
    plt.title('Class Distribution: Heart Disease or Attack')
    plt.savefig(os.path.join(output_dir, 'class_distribution.png'))
    plt.close()

    # 2. Correlation Analysis
    plt.figure(figsize=(16, 12))
    corr = df.corr()
    sns.heatmap(corr, annot=False, cmap='coolwarm', fmt=".2f", vmin=-1, vmax=1)
    plt.title('Feature Correlation Heatmap')
    plt.savefig(os.path.join(output_dir, 'correlation_heatmap.png'))
    plt.close()
    
    # Extract top correlated features with Target
    target_corr = corr['HeartDiseaseorAttack'].sort_values(ascending=False)
    print("Top features correlated with Heart Disease:\n", target_corr.head(6)[1:]) # skip self
    
    # 3. Feature vs Target Visualizations (Top 4 correlated)
    top_features = target_corr.head(5).index[1:]
    
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    axes = axes.flatten()
    for i, feature in enumerate(top_features):
        sns.histplot(data=df, x=feature, hue='HeartDiseaseorAttack', multiple='stack', ax=axes[i], palette='Set1', bins=20)
        axes[i].set_title(f'{feature} vs Target')
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'feature_vs_target.png'))
    plt.close()

    # 4. Age Distribution
    plt.figure(figsize=(8, 5))
    sns.countplot(data=df, x='Age', hue='HeartDiseaseorAttack', palette='Set2')
    plt.title('Heart Disease by Age Group (1=18-24 ... 13=80+)')
    plt.savefig(os.path.join(output_dir, 'age_distribution.png'))
    plt.close()
    
    # 5. BMI Distribution
    plt.figure(figsize=(8, 5))
    sns.kdeplot(data=df[df['HeartDiseaseorAttack']==0], x='BMI', label='No Disease', fill=True, color='green')
    sns.kdeplot(data=df[df['HeartDiseaseorAttack']==1], x='BMI', label='Disease', fill=True, color='red')
    plt.title('BMI Distribution vs Target')
    plt.legend()
    plt.savefig(os.path.join(output_dir, 'bmi_distribution.png'))
    plt.close()
    
    print(f"EDA completed. Visualizations saved to {output_dir}")
    return df

if __name__ == "__main__":
    run_eda()
