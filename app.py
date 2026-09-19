import streamlit as st
import pandas as pd
import numpy as np
import os
import joblib
import json

# Set page config before any other Streamlit commands
st.set_page_config(page_title="CardioRisk", page_icon="🫀", layout="wide")

from ml.explainability import generate_local_explanation, get_feature_names
from ml.recommendations import generate_recommendations
from auth.auth_manager import authenticate_user, register_user
from database.db_config import SessionLocal
from database.models import Prediction, HealthGoal
from utils.report_generator import generate_pdf_report, tamil_font_available
from utils.i18n import t, SUPPORTED_LANGUAGES

# ── Session state defaults ────────────────────────────────────────────────────
for key, default in [
    ('logged_in', False), ('user_id', None),
    ('username', None), ('lang', 'en')
]:
    if key not in st.session_state:
        st.session_state[key] = default

# ── Pre-load artifacts ────────────────────────────────────────────────────────
@st.cache_resource
def load_resources():
    return joblib.load('models/best_model.joblib'), joblib.load('models/scaler.joblib')

model, scaler = load_resources()


# ── Helpers ───────────────────────────────────────────────────────────────────
def _t(key, **kwargs):
    return t(key, lang=st.session_state.lang, **kwargs)

def display_disclaimer():
    st.warning(_t('disclaimer.text'))

def _yes_no(val):
    return _t('pred.yes') if val == 1 else _t('pred.no')


# ── Pages ─────────────────────────────────────────────────────────────────────
def render_auth():
    st.title(_t('auth.title'))
    tab_login, tab_reg = st.tabs([_t('auth.tab.login'), _t('auth.tab.register')])

    with tab_login:
        st.subheader(_t('auth.login.subtitle'))
        username = st.text_input(_t('auth.username'), key="login_username")
        password = st.text_input(_t('auth.password'), type="password", key="login_password")
        if st.button(_t('auth.btn.login')):
            user, msg = authenticate_user(username, password)
            if user:
                st.session_state.logged_in = True
                st.session_state.user_id   = user.id
                st.session_state.username  = user.username
                st.success(_t('auth.msg.login_success'))
                st.rerun()
            else:
                st.error(msg)

    with tab_reg:
        st.subheader(_t('auth.tab.register'))
        new_user  = st.text_input(_t('auth.username'), key="reg_username")
        new_email = st.text_input(_t('auth.email'),    key="reg_email")
        new_pass  = st.text_input(_t('auth.password'), type="password", key="reg_password")
        if st.button(_t('auth.btn.register')):
            success, msg = register_user(new_user, new_email, new_pass)
            if success:
                st.success(_t('auth.msg.register_success'))
            else:
                st.error(msg)


def render_home():
    st.title(_t('home.title', username=st.session_state.username))
    st.markdown(_t('home.subtitle'))
    st.markdown(_t('home.problem'))
    st.markdown(_t('home.objectives'))
    st.markdown("---")
    st.markdown(f"### {_t('home.global_importance.heading')}")
    st.markdown(_t('home.global_importance.desc'))
    global_img = 'images/explainability/global_summary.png'
    if os.path.exists(global_img):
        st.image(global_img, width=700, caption=_t('home.global_importance.caption'))
    else:
        st.info(_t('home.global_importance.missing'))
    display_disclaimer()


def render_predictor():
    st.title(_t('pred.title'))
    st.markdown(_t('pred.subtitle'))

    with st.form("prediction_form"):
        col1, col2, col3 = st.columns(3)

        with col1:
            st.markdown(_t('pred.sec.demographics'))
            age       = st.selectbox(_t('pred.age'), options=list(range(1, 14)), help=_t('pred.age.help'))
            sex       = st.radio(_t('pred.sex'), options=[0, 1],
                                 format_func=lambda x: _t('pred.sex.female') if x == 0 else _t('pred.sex.male'))
            education = st.selectbox(_t('pred.education'), options=list(range(1, 7)))
            income    = st.selectbox(_t('pred.income'),    options=list(range(1, 9)))

        with col2:
            st.markdown(_t('pred.sec.vitals'))
            bmi        = st.number_input(_t('pred.bmi'),      min_value=10, max_value=98, value=25)
            high_bp    = st.radio(_t('pred.highbp'),   options=[0, 1], format_func=lambda x: _t('pred.no') if x == 0 else _t('pred.yes'))
            high_chol  = st.radio(_t('pred.highchol'), options=[0, 1], format_func=lambda x: _t('pred.no') if x == 0 else _t('pred.yes'))
            chol_check = st.radio(_t('pred.cholcheck'),options=[0, 1], format_func=lambda x: _t('pred.no') if x == 0 else _t('pred.yes'))
            stroke     = st.radio(_t('pred.stroke'),   options=[0, 1], format_func=lambda x: _t('pred.no') if x == 0 else _t('pred.yes'))
            diabetes   = st.selectbox(_t('pred.diabetes'), options=[0, 1, 2], help=_t('pred.diabetes.help'))

        with col3:
            st.markdown(_t('pred.sec.lifestyle'))
            smoker        = st.radio(_t('pred.smoker'),       options=[0, 1], format_func=lambda x: _t('pred.no') if x == 0 else _t('pred.yes'))
            phys_activity = st.radio(_t('pred.physactivity'), options=[0, 1], format_func=lambda x: _t('pred.no') if x == 0 else _t('pred.yes'))
            fruits        = st.radio(_t('pred.fruits'),       options=[0, 1], format_func=lambda x: _t('pred.no') if x == 0 else _t('pred.yes'))
            veggies       = st.radio(_t('pred.veggies'),      options=[0, 1], format_func=lambda x: _t('pred.no') if x == 0 else _t('pred.yes'))
            hvy_alcohol   = st.radio(_t('pred.hvyalcohol'),   options=[0, 1], format_func=lambda x: _t('pred.no') if x == 0 else _t('pred.yes'))
            any_healthcare= st.radio(_t('pred.healthcare'),   options=[0, 1], format_func=lambda x: _t('pred.no') if x == 0 else _t('pred.yes'))
            no_doc_cost   = st.radio(_t('pred.nodoccost'),    options=[0, 1], format_func=lambda x: _t('pred.no') if x == 0 else _t('pred.yes'))
            gen_hlth      = st.selectbox(_t('pred.genhlth'), options=[1, 2, 3, 4, 5])
            ment_hlth     = st.number_input(_t('pred.menthlth'), min_value=0, max_value=30, value=0)
            phys_hlth     = st.number_input(_t('pred.physhlth'), min_value=0, max_value=30, value=0)
            diff_walk     = st.radio(_t('pred.diffwalk'),     options=[0, 1], format_func=lambda x: _t('pred.no') if x == 0 else _t('pred.yes'))

        submit = st.form_submit_button(_t('pred.btn.submit'))

    if submit:
        input_data = [[high_bp, high_chol, chol_check, bmi, smoker, stroke, diabetes,
                       phys_activity, fruits, veggies, hvy_alcohol, any_healthcare,
                       no_doc_cost, gen_hlth, ment_hlth, phys_hlth, diff_walk, sex, age,
                       education, income]]
        patient_df = pd.DataFrame(input_data, columns=get_feature_names())

        with st.spinner(_t('pred.spinner')):
            res = generate_local_explanation(patient_df)

        st.markdown("---")
        st.subheader(_t('result.title'))

        score = res['risk_score'] * 100
        if score < 30:
            category = _t('result.score.lower')
            st.success(f"**{_t('result.score.label', score=f'{score:.1f}', category=category)}**")
        elif score < 70:
            category = _t('result.score.moderate')
            st.warning(f"**{_t('result.score.label', score=f'{score:.1f}', category=category)}**")
        else:
            category = _t('result.score.higher')
            st.error(f"**{_t('result.score.label', score=f'{score:.1f}', category=category)}**")

        st.markdown("---")
        st.subheader(_t('result.shap.title'))
        st.markdown(f"*{_t('result.shap.caption')}*")
        local_img = 'images/explainability/local_waterfall.png'
        if os.path.exists(local_img):
            st.image(local_img, width=700, caption=_t('result.shap.img.caption'))

        st.markdown(_t('result.top_factors'))
        sorted_features = sorted(res['contributions'].items(), key=lambda item: abs(item[1]), reverse=True)
        top_features_dict = {}
        for feat, val in sorted_features[:3]:
            direction = _t('result.direction.increased') if val > 0 else _t('result.direction.decreased')
            st.markdown(_t('result.direction.text', feature=feat, direction=direction))
            top_features_dict[feat] = float(val)

        # Persist to database
        db = SessionLocal()
        try:
            pred_record = Prediction(
                user_id=st.session_state.user_id,
                input_summary=f"BMI: {bmi}, AgeGrp: {age}, GenHlth: {gen_hlth}",
                risk_score=score,
                risk_category=category,
                top_shap_features=json.dumps(top_features_dict)
            )
            db.add(pred_record)
            db.commit()
            st.toast(_t('result.saved'))
        except Exception as e:
            st.error(_t('result.save_error', error=str(e)))
        finally:
            db.close()

        display_disclaimer()


def render_history():
    st.title(_t('history.title'))
    db = SessionLocal()
    try:
        preds = (db.query(Prediction)
                   .filter(Prediction.user_id == st.session_state.user_id)
                   .order_by(Prediction.created_at.desc())
                   .all())
        if not preds:
            st.info(_t('history.empty'))
        else:
            for p in preds:
                label = f"{p.created_at.strftime('%Y-%m-%d %H:%M')} — {p.risk_category} ({p.risk_score:.1f}%)"
                with st.expander(label):
                    st.write(f"{_t('history.input_summary')} {p.input_summary}")
                    st.write(_t('history.drivers'))
                    for k, v in json.loads(p.top_shap_features).items():
                        st.write(f"- {k}: {v:.4f}")
    finally:
        db.close()


def render_goals():
    st.title(_t('goals.title'))
    st.markdown(_t('goals.subtitle'))
    db = SessionLocal()
    try:
        new_goal = st.text_input(_t('goals.input'))
        if st.button(_t('goals.btn.save')) and new_goal:
            db.add(HealthGoal(user_id=st.session_state.user_id, goal=new_goal))
            db.commit()
            st.toast(_t('goals.saved'))
            st.rerun()

        st.markdown(_t('goals.heading.active'))
        goals = (db.query(HealthGoal)
                   .filter(HealthGoal.user_id == st.session_state.user_id,
                           HealthGoal.status == "active")
                   .all())
        if not goals:
            st.info(_t('goals.empty'))
        else:
            for g in goals:
                col1, col2 = st.columns([0.8, 0.2])
                with col1:
                    st.write(f"- {g.goal}")
                with col2:
                    if st.button(_t('goals.btn.achieve'), key=f"achieve_{g.id}"):
                        g.status = "achieved"
                        db.commit()
                        st.rerun()
    finally:
        db.close()


def render_report():
    st.title(_t('report.title'))
    st.markdown(_t('report.subtitle'))

    db = SessionLocal()
    try:
        latest = (db.query(Prediction)
                    .filter(Prediction.user_id == st.session_state.user_id)
                    .order_by(Prediction.created_at.desc())
                    .first())
    finally:
        db.close()

    if not latest:
        st.info(_t('report.empty'))
        return

    st.markdown("---")
    score    = latest.risk_score
    category = latest.risk_category

    if "Lower" in category or "குறைந்த" in category:
        st.success(f"**{_t('result.score.label', score=f'{score:.1f}', category=category)}**")
    elif "Moderate" in category or "மிதமான" in category:
        st.warning(f"**{_t('result.score.label', score=f'{score:.1f}', category=category)}**")
    else:
        st.error(f"**{_t('result.score.label', score=f'{score:.1f}', category=category)}**")

    col1, col2 = st.columns(2)
    with col1:
        st.markdown(f"{_t('report.timestamp')} {latest.created_at.strftime('%Y-%m-%d %H:%M UTC')}")
    with col2:
        st.markdown(f"{_t('report.input_summary')} {latest.input_summary}")

    # SHAP chart
    st.markdown(_t('report.shap.title'))
    st.caption(_t('report.shap.caption'))
    local_img = 'images/explainability/local_waterfall.png'
    if os.path.exists(local_img):
        st.image(local_img, width=680, caption=_t('report.shap.img.caption'))

    # SHAP table
    st.markdown(_t('report.factors.title'))
    top_feats    = json.loads(latest.top_shap_features)
    sorted_feats = sorted(top_feats.items(), key=lambda x: abs(x[1]), reverse=True)
    shap_table   = {
        _t('report.table.feature'):   [f for f, _ in sorted_feats],
        _t('report.table.value'):     [round(v, 4) for _, v in sorted_feats],
        _t('report.table.direction'): [
            _t('report.direction.increased') if v > 0 else _t('report.direction.decreased')
            for _, v in sorted_feats
        ],
    }
    st.dataframe(shap_table, use_container_width=True)

    # Recommendations
    st.markdown(_t('report.rec.title'))
    st.caption(_t('report.rec.caption'))
    feature_proxy = {feat: (1 if val > 0 else 0) for feat, val in top_feats.items()}
    rec_keys      = generate_recommendations(feature_proxy)
    translated_recs = [_t(k) for k in rec_keys]
    for i, rec in enumerate(translated_recs, 1):
        st.markdown(f"**{i}.** {rec}")

    # PDF download
    st.markdown("---")
    st.markdown(_t('report.download.heading'))
    if st.session_state.lang == 'ta' and not tamil_font_available():
        st.info("ℹ️ Tamil font not found locally — PDF report will be generated in English.")
        pdf_lang = 'en'
    else:
        pdf_lang = st.session_state.lang

    shap_img_path = local_img if os.path.exists(local_img) else None
    pdf_bytes = generate_pdf_report(
        username=st.session_state.username,
        timestamp=latest.created_at,
        risk_score=score,
        risk_category=category,
        input_summary=latest.input_summary,
        top_shap_features=top_feats,
        recommendations=translated_recs,
        shap_image_path=shap_img_path,
        lang=pdf_lang,
    )
    ts_str = latest.created_at.strftime('%Y%m%d_%H%M')
    st.download_button(
        label=_t('report.btn.download'),
        data=pdf_bytes,
        file_name=f"cardiorisk_report_{st.session_state.username}_{ts_str}.pdf",
        mime="application/pdf",
    )
    display_disclaimer()


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    if not st.session_state.logged_in:
        # Language selector even on auth page
        lang_choice = st.sidebar.selectbox(
            "Language / மொழி",
            options=list(SUPPORTED_LANGUAGES.keys()),
            index=0 if st.session_state.lang == 'en' else 1
        )
        st.session_state.lang = SUPPORTED_LANGUAGES[lang_choice]
        render_auth()
    else:
        st.sidebar.title(_t('nav.title'))

        # Language selector (persists across pages)
        lang_choice = st.sidebar.selectbox(
            _t('nav.language'),
            options=list(SUPPORTED_LANGUAGES.keys()),
            index=0 if st.session_state.lang == 'en' else 1
        )
        st.session_state.lang = SUPPORTED_LANGUAGES[lang_choice]

        page = st.sidebar.radio(
            "Go to",
            [_t('nav.home'), _t('nav.predictor'), _t('nav.report'),
             _t('nav.history'), _t('nav.goals')]
        )

        if st.sidebar.button(_t('nav.btn.logout')):
            for k in ['logged_in', 'user_id', 'username']:
                st.session_state[k] = None if k != 'logged_in' else False
            st.rerun()

        if   page == _t('nav.home'):      render_home()
        elif page == _t('nav.predictor'): render_predictor()
        elif page == _t('nav.report'):    render_report()
        elif page == _t('nav.history'):   render_history()
        elif page == _t('nav.goals'):     render_goals()


if __name__ == "__main__":
    main()
