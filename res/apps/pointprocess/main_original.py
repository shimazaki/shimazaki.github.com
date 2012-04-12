#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Twitter API用サンプルコードについて

ソースコードの改変および利用、再配布は、商用、非商用と問わず自由です。
なお、本ソースコードを利用した場合に発生するトラブルに関しては一切責任
を負いません。

Modifying, using and/or distributing this source code is free for
commercial/noncommercial purposes. However, Fmfmsoft corp. has no
respobsibilities for any troubles caused by utilizing this source code.

Auther : 株式会社 ふむふむソフト fmfmsoft corp. 

"""
__author__ = "fmfmsoft corp."

import re
import time
import datetime
from decimal import *
import logging


import oauth
import os
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp import util
from django.utils import simplejson
from simple_cookie import Cookies

#画面表示用テンプレートHTMLのファイル名
LOGIN_TEMPLATE_NAME = 'login.html' #ログイン画面
HOME_TEMPLATE_NAME = 'home.html' #タイムライン表示用

#API登録時に表示されるConsumer keyとConsumer secretを指定してください
CONSUMER_KEY = "fiXKf2AQBs1peVOdEwPgRA" #Consumer key
CONSUMER_SECRET = "OkVAW0ViqIuEkD5gE6K8UFaOuhXQh23flEE5dwq7QY" #Consumer secret

#Cookieの有効期間（秒）
COOKIE_EXPIRE_TIME = 300

#表示するタイムラインの数
TIMELINE_COUNT = 30


#-----------------------------------------------------------
#共通処理
#-----------------------------------------------------------
#-----------------------------------------------------------
#Twitter APIを利用するTwitterClientクラス（oauth.py）と
#ユーザー情報を保存するCookiesクラス（simple_cookie.py）を作成する
#-----------------------------------------------------------
def CreateClientAndCookie(self):

    #Twitter認証画面からのコールバック用URLを設定
    callback_url = "%s/verify" % self.request.host_url

    #TwitterClientクラスの作成
    client = oauth.TwitterClient(CONSUMER_KEY, CONSUMER_SECRET, 
        callback_url)
    #Cookiesクラスの作成
    cookie = Cookies(self, max_age=COOKIE_EXPIRE_TIME)

    return client, cookie


#-----------------------------------------------------------
#OAuthの認証後に、アクセストークンをCookieに保存
#-----------------------------------------------------------
def VerityAuth(self, client, cookie):
    auth_token = self.request.get("oauth_token")
    auth_verifier = self.request.get("oauth_verifier")
    user_info = client.get_user_info(auth_token, auth_verifier=auth_verifier)
    
    #アクセストークンをCookieへ保存
    cookie["user_token"] = user_info["token"]
    cookie["user_secret"] = user_info["secret"]
    cookie["screen_name"] = user_info["username"]


#-----------------------------------------------------------
#Cookieの更新
#-----------------------------------------------------------
def UpdateCookie(self, cookie) :
    cookie["user_token"] = cookie["user_token"]
    cookie["user_secret"] = cookie["user_secret"]
    cookie["screen_name"] = cookie["screen_name"]


#-----------------------------------------------------------
#Cookieの更新
#-----------------------------------------------------------
def ClearCookie(self, cookie) :
    cookie.delete_cookie("user_token")
    cookie.delete_cookie("user_secret")
    cookie.delete_cookie("screen_name")


#-----------------------------------------------------------
#Cookie内のアクセストークンの有無を確認
#（Falseであれば再度認証する）
#-----------------------------------------------------------
def CheckUserInfo(self):
    cookie = Cookies(self, max_age=COOKIE_EXPIRE_TIME)

    #Cookieのキーをチェックし、存在の有無をチェック
    if cookie.has_key("user_token") and cookie.has_key("user_secret") and cookie.has_key("screen_name") :
      return True
    else :
      return False


#-----------------------------------------------------------
#APIから取得したResultを表示用に調整する
#-----------------------------------------------------------
def FormatResult(result) :
    for i in range(0, len(result)) :
        #textのリンク化（ユーザー名、URL）して、display_textという名前でresultに追加
        result[i]["display_text"] = ReplaceLink(result[i]["text"])
        #時刻表示の追加
        displayTime = GetDisplayTime(result[i]["created_at"], result[i]["user"]["utc_offset"]);
        #時間差をdisplay_timeという名前でresultに追加
        result[i]["display_time"] = displayTime
    return result


#-----------------------------------------------------------
#URL,ユーザー名のリンク化
#-----------------------------------------------------------
def ReplaceLink(str) :
    #URL
    str = re.sub("(http://[\w|/|\.|%|&|\?|=|\-|#]+)", r'<a href="\1" target=\"_blank\">\1</a>', str)
    #ユーザー名
    str = re.sub("@([\w|/|\.|%|&|\?|=|\-|#]+)", r'@<a href="/friends/\1">\1</a>', str)
    return str


#-----------------------------------------------------------
#時間差を計算して時刻の文字列を生成
#-----------------------------------------------------------
def GetDisplayTime(datetimeStr, utc_offset) :
    dtTarget = datetime.datetime.strptime(datetimeStr, "%a %b %d %H:%M:%S +0000 %Y")
    dtNow = datetime.datetime.now()


    #時間差の計算(※取得するオブジェクトはtimedelta)
    dtdiff = dtNow - dtTarget;
    
    #1日以上は時刻を表示
    if dtdiff.days > 0 :
        datetimeStr = dtTarget.strftime("%Y-%m-%d %H:%M:%S")
        
    #1時間以上
    elif dtdiff.seconds > 3600 :
        datetimeStr = str(Decimal(dtdiff.seconds / 3600).quantize(Decimal('1.'), rounding=ROUND_DOWN)) + u"時間前"

    #1分以上
    elif dtdiff.seconds > 60 :
        datetimeStr = str(Decimal(dtdiff.seconds / 60).quantize(Decimal('1.'), rounding=ROUND_DOWN)) + u"分前"

    #1分以内
    else :
        datetimeStr = str(dtdiff.seconds) + u"秒前"

    return datetimeStr
	#return str(dtdiff.seconds)


#-----------------------------------------------------------
#通常（自分のタイムラインを表示する場合）のリクエストハンドラ
#-----------------------------------------------------------
class MainHandler(webapp.RequestHandler):
    #-----------------------------------------------------------
    #Get（URLパラメータ）情報の処理
    #-----------------------------------------------------------
    def get(self, mode=""):
    
        #TwitterClient、Cookiesクラスの作成
        (client, cookie) = CreateClientAndCookie(self)
     
        #Twitterの認証画面表示
        if mode == "login":
            #Twitterの認証画面へリダイレクトする
            return self.redirect(client.get_authorization_url())
    
        #ログアウト処理
        if mode == "logout":
            #Cookieのクリア
            ClearCookie(self, cookie)
            #初期画面へリダイレクト
            return self.redirect("/")
    
        #認証後のコールバックURL  
        if mode == "verify":
            #認証確認
            VerityAuth(self, client, cookie)
            #初期画面へリダイレクト
            return self.redirect("/")
    
        #つぶやき削除処理
        if mode == "delete":
            
            if CheckUserInfo(self) == False :
                #認証が済んでいない場合は認証画面へリダイレクト
                return self.redirect("/")
            
            #発言IDをGet情報から取得
            status_id = self.request.get("id")
            
            client.make_request('http://api.twitter.com/1/statuses/destroy/' + status_id + '.json',
                token=cookie["user_token"], #Cookieから
                secret=cookie["user_secret"], #Cookieから
                protected=True,
                method='POST')
            
            #つぶやき追加後にタイムラインを改めて表示
            return self.redirect("/")

        #通常処理
        #（login、verity以外の場合）
    
        #認証が済んでいるかをチェック
        if CheckUserInfo(self) == True : #認証済みの場合
            #自分のタイムラインを表示
            self.ShowMyTimeline(client, cookie)
        else : #認証が完了していない、あるいはCookieがタイムアウトしている場合
            #ログイン画面の表示
            self.ShowLogin()
  
    #-----------------------------------------------------------
    #Post情報の処理    
    #-----------------------------------------------------------
    def post(self, mode=""):

        #TwitterClient、Cookiesクラスの作成
        (client, cookie) = CreateClientAndCookie(self)

        #つぶやき追加処理
        if mode == "tweet":
            if CheckUserInfo(self) == False :
                #認証が済んでいない場合は認証画面へリダイレクト
                return self.redirect("/")
            
            #発言内容をPost情報から取得
            status = self.request.get("status")
          
            #Twitter API呼び出し用パラメータの作成
            param = {'status': status}
    
            client.make_request('http://api.twitter.com/1/statuses/update.json',
                token=cookie["user_token"], #Cookieから
                secret=cookie["user_secret"], #Cookieから
                additional_params=param, #作成したパラメータオブジェクト
                protected=True,
                method='POST')
            
            #つぶやき追加後にタイムラインを改めて表示
            return self.redirect("/")

    #-----------------------------------------------------------
    #ログイン画面（初期画面）の表示
    #-----------------------------------------------------------
    def ShowLogin(self):  
        template_values = {}
        tmpl = os.path.join(os.path.dirname(__file__), LOGIN_TEMPLATE_NAME)
        self.response.out.write(template.render(tmpl, template_values ))


    #-----------------------------------------------------------
    #自分のタイムラインを表示
    #-----------------------------------------------------------
    def ShowMyTimeline(self, client, cookie):
        param = {'count': TIMELINE_COUNT}
        timeline_url = "http://api.twitter.com/1/statuses/home_timeline.json"
        response = client.make_request(url=timeline_url,
            token=cookie["user_token"], 
            secret=cookie["user_secret"],
            additional_params=param)

        #表示のたびにCookieを更新する
        UpdateCookie(self, cookie)

        #結果の取得
        try:
            result = simplejson.loads(response.content)

            #表示用にデータを調整
            display_result = FormatResult(result)
         
            template_values = {
                'IsMyHome': True,
                'MyScreenName' : cookie["screen_name"],
                'OwnerName' : cookie["screen_name"],
                'result': display_result
            }
            #テンプレートの読み込み
            tmpl = os.path.join(os.path.dirname(__file__), HOME_TEMPLATE_NAME)
            #画面表示
            return self.response.out.write(template.render(tmpl, template_values))

        except:
            #エラー時
            #Cookieのクリア
            ClearCookie(self, cookie)
            return self.redirect("/")


#-----------------------------------------------------------
#友人のタイムラインを表示する場合のリクエストハンドラ
#-----------------------------------------------------------
class FriendsHandler(webapp.RequestHandler):
  
    #-----------------------------------------------------------
    #Get（URLパラメータ）情報の処理
    #-----------------------------------------------------------
    def get(self, screen_name=""):

        #TwitterClient、Cookiesクラスの作成
        (client, cookie) = CreateClientAndCookie(self)
     
        if screen_name == "" :
          return self.redirect("/")
        else :
          self.ShowFriendTimeline(client, cookie, screen_name)

    #-----------------------------------------------------------
    #友人のタイムラインを表示
    #-----------------------------------------------------------
    def ShowFriendTimeline(self, client, cookie, screen_name):
    
        #認証済みかチェック
        if CheckUserInfo(self) == True : #認証済み
          
            #Twitter API呼び出し用パラメータの作成
            param = {
                'screen_name' : screen_name,
                'count': TIMELINE_COUNT}
    
            #呼び出すAPI関数のURL（友人のタイムラインをJSON形式で取得）
            timeline_url = "http://api.twitter.com/1/statuses/user_timeline.json"
    
            #API関数の実行（URLの呼び出し）
            response = client.make_request(url=timeline_url,
                token=cookie["user_token"], #Cookieから
                secret=cookie["user_secret"], #Cookieから
                additional_params=param) #作成したパラメータオブジェクト
      
            #表示のたびにCookieを更新する
            UpdateCookie(self, cookie)
          
            #結果の取得
            try:
                result = simplejson.loads(response.content)
      
                #表示用にデータを調整
                display_result = FormatResult(result)
        
                #テンプレート表示用の値を設定
                template_values = {
                'MyScreenName' : cookie["screen_name"],
                'OwnerName' : screen_name,
                  'result': display_result
                }
    
                #テンプレートの読み込み
                tmpl = os.path.join(os.path.dirname(__file__), HOME_TEMPLATE_NAME)
                #画面表示
                return self.response.out.write(template.render(tmpl, template_values))

            except:
                #エラー時
                #Cookieのクリア
                ClearCookie(self, cookie)
                return self.redirect("/")
    
        else: #未認証
            #初期画面（未認証の場合はログイン画面）にリダイレクト
            return self.redirect("/")

#-----------------------------------------------------------
# Program by Shimazaki
#-----------------------------------------------------------
#result[i]["user"]["utc_offset"]

#-----------------------------------------------------------
#メイン関数
#-----------------------------------------------------------
def main():
    #URLによってリクエストハンドラを切り替える
    application = webapp.WSGIApplication([
                                          ('/friends/(\w+)', FriendsHandler), #URLにfreands/が含まれる場合
                                          ('/(.*)', MainHandler) #それ以外（通常）の場合
                                          ],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
