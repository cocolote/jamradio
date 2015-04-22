class UsersController < ApplicationController
  respond_to :json

  def index
    respond_to do |format|
      format.json { render json: User.where("user_name ILIKE '#{params[:q]}%'") }
    end
  end
end
